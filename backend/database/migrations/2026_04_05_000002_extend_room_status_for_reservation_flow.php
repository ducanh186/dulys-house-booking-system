<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE rooms MODIFY COLUMN status ENUM('available','locked','booked','occupied','maintenance') DEFAULT 'available'");
    }

    public function down(): void
    {
        DB::statement("UPDATE rooms SET status = 'available' WHERE status IN ('locked', 'booked')");
        DB::statement("ALTER TABLE rooms MODIFY COLUMN status ENUM('available','occupied','maintenance') DEFAULT 'available'");
    }
};
