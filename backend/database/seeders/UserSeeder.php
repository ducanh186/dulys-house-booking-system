<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            // Staff accounts
            [
                'name' => 'Admin',
                'email' => 'admin@dulyshouse.vn',
                'password' => 'password',
                'role' => 'admin',
                'phone' => '0901000001',
            ],
            [
                'name' => 'Chủ nhà',
                'email' => 'owner@dulyshouse.vn',
                'password' => 'password',
                'role' => 'owner',
                'phone' => '0901000002',
            ],
            [
                'name' => 'Lễ tân',
                'email' => 'staff@dulyshouse.vn',
                'password' => 'password',
                'role' => 'staff',
                'phone' => '0901000003',
            ],
            // Guest accounts - đa dạng để test booking
            [
                'name' => 'Nguyễn Văn Khách',
                'email' => 'guest@dulyshouse.vn',
                'password' => 'password',
                'role' => 'guest',
                'phone' => '0901000004',
            ],
            [
                'name' => 'Trần Thị Hương',
                'email' => 'huong@gmail.com',
                'password' => 'password',
                'role' => 'guest',
                'phone' => '0901000005',
            ],
            [
                'name' => 'Lê Minh Tuấn',
                'email' => 'tuan.le@gmail.com',
                'password' => 'password',
                'role' => 'guest',
                'phone' => '0912345678',
            ],
            [
                'name' => 'Phạm Thị Mai',
                'email' => 'mai.pham@outlook.com',
                'password' => 'password',
                'role' => 'guest',
                'phone' => '0987654321',
            ],
            [
                'name' => 'Hoàng Đức Anh',
                'email' => 'ducanh@yahoo.com',
                'password' => 'password',
                'role' => 'guest',
                'phone' => '0933111222',
            ],
        ];

        foreach ($users as $data) {
            User::create($data);
        }
    }
}
