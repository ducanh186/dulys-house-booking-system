<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        // 1) Normalize existing data so new constraints can be added safely.
        $this->normalizeRoomCodeDuplicates();
        $this->normalizeDateRanges();
        $this->normalizeRatings();

        // 2) Add unique index for room_code.
        Schema::table('rooms', function (Blueprint $table) {
            $table->unique('room_code', 'rooms_room_code_unique');
        });

        // 3) Add check constraints.
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE bookings ADD CONSTRAINT bookings_check_out_after_check_in CHECK (check_out > check_in)');
            DB::statement('ALTER TABLE blocked_dates ADD CONSTRAINT blocked_dates_valid_range CHECK (date_to >= date_from)');
            DB::statement('ALTER TABLE price_overrides ADD CONSTRAINT price_overrides_valid_range CHECK (date_to >= date_from)');
            DB::statement('ALTER TABLE reviews ADD CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5)');
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE reviews DROP CHECK reviews_rating_range');
            DB::statement('ALTER TABLE price_overrides DROP CHECK price_overrides_valid_range');
            DB::statement('ALTER TABLE blocked_dates DROP CHECK blocked_dates_valid_range');
            DB::statement('ALTER TABLE bookings DROP CHECK bookings_check_out_after_check_in');
        }

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropUnique('rooms_room_code_unique');
        });
    }

    private function normalizeRoomCodeDuplicates(): void
    {
        $duplicates = DB::table('rooms')
            ->select('room_code')
            ->groupBy('room_code')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('room_code');

        foreach ($duplicates as $roomCode) {
            $rows = DB::table('rooms')
                ->select('id', 'room_code')
                ->where('room_code', $roomCode)
                ->orderBy('created_at')
                ->orderBy('id')
                ->get();

            // Keep first record unchanged, rename remaining records deterministically.
            foreach ($rows->slice(1)->values() as $index => $row) {
                $base = (string) $row->room_code;
                $suffix = $index + 2;
                $candidate = $base . '-' . $suffix;

                while (DB::table('rooms')->where('room_code', $candidate)->exists()) {
                    $suffix++;
                    $candidate = $base . '-' . $suffix;
                }

                DB::table('rooms')
                    ->where('id', $row->id)
                    ->update(['room_code' => $candidate]);
            }
        }
    }

    private function normalizeDateRanges(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        $oneDayExpression = in_array($driver, ['mysql', 'mariadb'], true)
            ? 'DATE_ADD(check_in, INTERVAL 1 DAY)'
            : "datetime(check_in, '+1 day')";

        // Ensure booking interval remains valid before adding CHECK constraint.
        DB::table('bookings')
            ->whereColumn('check_out', '<=', 'check_in')
            ->update([
                'check_out' => DB::raw($oneDayExpression),
            ]);

        // Ensure blocked date ranges are not inverted.
        DB::statement(
            'UPDATE blocked_dates
             SET date_from = CASE WHEN date_from <= date_to THEN date_from ELSE date_to END,
                 date_to = CASE WHEN date_from <= date_to THEN date_to ELSE date_from END
             WHERE date_from > date_to'
        );

        // Ensure override date ranges are not inverted.
        DB::statement(
            'UPDATE price_overrides
             SET date_from = CASE WHEN date_from <= date_to THEN date_from ELSE date_to END,
                 date_to = CASE WHEN date_from <= date_to THEN date_to ELSE date_from END
             WHERE date_from > date_to'
        );
    }

    private function normalizeRatings(): void
    {
        DB::table('reviews')
            ->where('rating', '<', 1)
            ->update(['rating' => 1]);

        DB::table('reviews')
            ->where('rating', '>', 5)
            ->update(['rating' => 5]);
    }
};
