<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo customer record cho mỗi guest user
        $guests = User::where('role', 'guest')->get();
        foreach ($guests as $guest) {
            Customer::create([
                'user_id' => $guest->id,
                'full_name' => $guest->name,
                'phone' => $guest->phone,
                'email' => $guest->email,
            ]);
        }

        // Khách vãng lai (walk-in, không có tài khoản)
        $walkIns = [
            [
                'full_name' => 'Lê Văn Vãng Lai',
                'phone' => '0909999999',
                'email' => null,
                'notes' => 'Khách vãng lai đặt tại quầy',
            ],
            [
                'full_name' => 'Park Min Jun',
                'phone' => '0908888777',
                'email' => 'minjun@naver.com',
                'notes' => 'Khách Hàn Quốc, đặt qua điện thoại',
            ],
            [
                'full_name' => 'Nguyễn Thị Bé',
                'phone' => '0977666555',
                'email' => null,
                'notes' => 'Khách quen, hay đặt phòng Đà Lạt cuối tuần',
            ],
        ];

        foreach ($walkIns as $data) {
            Customer::create(array_merge($data, ['user_id' => null]));
        }
    }
}
