<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Optimizes overlap checks on active booking statuses.
            $table->index(['status', 'check_in', 'check_out'], 'bookings_status_checkin_checkout_idx');
        });

        Schema::table('booking_details', function (Blueprint $table) {
            // Optimizes aggregation by room type joined through booking_id.
            $table->index(['room_type_id', 'booking_id'], 'booking_details_room_type_booking_idx');
        });

        Schema::table('rooms', function (Blueprint $table) {
            // Optimizes available-room lookup by type + status with room_code ordering.
            $table->index(['room_type_id', 'status', 'room_code'], 'rooms_type_status_code_idx');
        });

        Schema::table('blocked_dates', function (Blueprint $table) {
            // Optimizes room-type date-range overlap checks.
            $table->index(['room_type_id', 'date_from', 'date_to'], 'blocked_dates_room_type_range_idx');
        });

        Schema::table('price_overrides', function (Blueprint $table) {
            // Optimizes date-specific price override lookups.
            $table->index(['room_type_id', 'date_from', 'date_to'], 'price_overrides_room_type_range_idx');
        });

        Schema::table('booking_detail_rooms', function (Blueprint $table) {
            // Optimizes traversal from room -> assigned booking details.
            $table->index(['room_id', 'booking_detail_id'], 'booking_detail_rooms_room_booking_detail_idx');
        });
    }

    public function down(): void
    {
        Schema::table('booking_detail_rooms', function (Blueprint $table) {
            $table->dropIndex('booking_detail_rooms_room_booking_detail_idx');
        });

        Schema::table('price_overrides', function (Blueprint $table) {
            $table->dropIndex('price_overrides_room_type_range_idx');
        });

        Schema::table('blocked_dates', function (Blueprint $table) {
            $table->dropIndex('blocked_dates_room_type_range_idx');
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropIndex('rooms_type_status_code_idx');
        });

        Schema::table('booking_details', function (Blueprint $table) {
            $table->dropIndex('booking_details_room_type_booking_idx');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('bookings_status_checkin_checkout_idx');
        });
    }
};
