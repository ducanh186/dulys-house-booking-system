<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend booking status enum
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','pending_payment','payment_review','confirmed','checked_in','checked_out','cancelled','expired') DEFAULT 'pending'");

        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('confirmed_at')->nullable()->after('expires_at');
            $table->timestamp('cancelled_at')->nullable()->after('confirmed_at');
            $table->string('cancel_reason', 500)->nullable()->after('cancelled_at');
        });

        // Extend payment status enum
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending','proof_uploaded','success','failed','refunded','expired') DEFAULT 'pending'");

        Schema::table('payments', function (Blueprint $table) {
            $table->string('transfer_content', 100)->nullable()->after('status');
            $table->text('qr_payload')->nullable()->after('transfer_content');
            $table->string('proof_image_url', 500)->nullable()->after('qr_payload');
            $table->timestamp('proof_uploaded_at')->nullable()->after('proof_image_url');
            $table->foreignUuid('verified_by')->nullable()->after('proof_uploaded_at')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verified_by');
            $table->timestamp('expires_at')->nullable()->after('verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn([
                'transfer_content', 'qr_payload', 'proof_image_url',
                'proof_uploaded_at', 'verified_by', 'verified_at', 'expires_at',
            ]);
        });

        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending','success','failed','refunded') DEFAULT 'pending'");

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['confirmed_at', 'cancelled_at', 'cancel_reason']);
        });

        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','confirmed','checked_in','checked_out','cancelled') DEFAULT 'pending'");
    }
};
