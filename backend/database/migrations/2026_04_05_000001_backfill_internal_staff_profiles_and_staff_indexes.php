<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const INTERNAL_ROLES = ['admin', 'owner', 'staff'];
    private const UNIQUE_INDEX = 'staff_user_id_unique';

    public function up(): void
    {
        DB::transaction(function () {
            $this->deduplicateStaffProfiles();
            $this->backfillInternalStaffProfiles();
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->unique('user_id', self::UNIQUE_INDEX);
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropUnique(self::UNIQUE_INDEX);
        });
    }

    private function deduplicateStaffProfiles(): void
    {
        $duplicates = DB::table('staff')
            ->select('user_id')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('user_id');

        foreach ($duplicates as $userId) {
            $profiles = DB::table('staff')
                ->where('user_id', $userId)
                ->orderBy('created_at')
                ->orderBy('id')
                ->get();

            $keeper = $profiles->first();

            foreach ($profiles->slice(1) as $profile) {
                DB::table('bookings')
                    ->where('staff_id', $profile->id)
                    ->update(['staff_id' => $keeper->id]);

                DB::table('staff')
                    ->where('id', $profile->id)
                    ->delete();
            }
        }
    }

    private function backfillInternalStaffProfiles(): void
    {
        $users = DB::table('users')
            ->leftJoin('staff', 'staff.user_id', '=', 'users.id')
            ->whereIn('users.role', self::INTERNAL_ROLES)
            ->whereNull('staff.id')
            ->select('users.id', 'users.name', 'users.email', 'users.phone', 'users.role', 'users.created_at', 'users.updated_at')
            ->get();

        foreach ($users as $user) {
            DB::table('staff')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'full_name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'role_title' => $this->roleTitleFor($user->role),
                'is_active' => true,
                'created_at' => $user->created_at ?? now(),
                'updated_at' => $user->updated_at ?? now(),
            ]);
        }
    }

    private function roleTitleFor(string $role): string
    {
        return match ($role) {
            'admin' => 'Quản trị',
            'owner' => 'Quản lý',
            default => 'Lễ tân',
        };
    }
};
