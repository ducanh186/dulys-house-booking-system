<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@dulyshouse.vn')->first();
        $owner = User::where('email', 'owner@dulyshouse.vn')->first();
        $staffUser = User::where('email', 'staff@dulyshouse.vn')->first();

        if ($admin) {
            Staff::updateOrCreate(
                ['user_id' => $admin->id],
                [
                    'full_name' => 'Admin Duly House',
                    'phone' => $admin->phone,
                    'email' => $admin->email,
                    'role_title' => 'Quản trị',
                    'is_active' => true,
                ]
            );
        }

        if ($owner) {
            Staff::updateOrCreate(
                ['user_id' => $owner->id],
                [
                    'full_name' => 'Chủ nhà - Duly',
                    'phone' => $owner->phone,
                    'email' => $owner->email,
                    'role_title' => 'Quản lý',
                    'is_active' => true,
                ]
            );
        }

        if ($staffUser) {
            Staff::updateOrCreate(
                ['user_id' => $staffUser->id],
                [
                    'full_name' => 'Nguyễn Thị Lễ Tân',
                    'phone' => $staffUser->phone,
                    'email' => $staffUser->email,
                    'role_title' => 'Lễ tân',
                    'is_active' => true,
                ]
            );
        }
    }
}
