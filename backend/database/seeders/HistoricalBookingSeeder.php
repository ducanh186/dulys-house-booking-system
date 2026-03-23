<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class HistoricalBookingSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::all();
        $homestays = Homestay::where('is_active', true)->with('roomTypes')->get();

        if ($customers->isEmpty() || $homestays->isEmpty()) {
            return;
        }

        // Tạo booking lịch sử cho 12 tháng gần nhất (04/2025 → 03/2026)
        // Mô phỏng tăng trưởng doanh thu theo mùa
        $monthConfigs = [
            // 2025 — mùa thấp điểm + tăng dần
            ['year' => 2025, 'month' => 4, 'count' => 5, 'status_weights' => ['checked_out' => 4, 'cancelled' => 1]],
            ['year' => 2025, 'month' => 5, 'count' => 7, 'status_weights' => ['checked_out' => 6, 'cancelled' => 1]],
            ['year' => 2025, 'month' => 6, 'count' => 10, 'status_weights' => ['checked_out' => 8, 'cancelled' => 2]],
            ['year' => 2025, 'month' => 7, 'count' => 13, 'status_weights' => ['checked_out' => 11, 'cancelled' => 2]],
            ['year' => 2025, 'month' => 8, 'count' => 12, 'status_weights' => ['checked_out' => 10, 'cancelled' => 2]],
            ['year' => 2025, 'month' => 9, 'count' => 9, 'status_weights' => ['checked_out' => 7, 'cancelled' => 2]],
            ['year' => 2025, 'month' => 10, 'count' => 8, 'status_weights' => ['checked_out' => 6, 'cancelled' => 2]],
            ['year' => 2025, 'month' => 11, 'count' => 6, 'status_weights' => ['checked_out' => 5, 'cancelled' => 1]],
            ['year' => 2025, 'month' => 12, 'count' => 11, 'status_weights' => ['checked_out' => 9, 'cancelled' => 2]],
            // 2026 — cao điểm đầu năm
            ['year' => 2026, 'month' => 1, 'count' => 8, 'status_weights' => ['checked_out' => 6, 'cancelled' => 2]],
            ['year' => 2026, 'month' => 2, 'count' => 14, 'status_weights' => ['checked_out' => 12, 'cancelled' => 2]],
            ['year' => 2026, 'month' => 3, 'count' => 11, 'status_weights' => ['checked_out' => 9, 'cancelled' => 2]],
        ];

        foreach ($monthConfigs as $config) {
            $this->seedMonth($customers, $homestays, $config);
        }
    }

    private function seedMonth($customers, $homestays, array $config): void
    {
        $year = $config['year'];
        $month = $config['month'];
        $count = $config['count'];
        $statusWeights = $config['status_weights'];

        // Build a flat list of statuses based on weights
        $statuses = [];
        foreach ($statusWeights as $status => $weight) {
            for ($i = 0; $i < $weight; $i++) {
                $statuses[] = $status;
            }
        }

        $daysInMonth = Carbon::create($year, $month)->daysInMonth;

        for ($i = 0; $i < $count; $i++) {
            $homestay = $homestays->random();
            $roomType = $homestay->roomTypes->random();
            $customer = $customers->random();
            $status = $statuses[$i % count($statuses)];

            // Random check-in day within the month
            $checkInDay = rand(1, max(1, $daysInMonth - 4));
            $nights = rand(1, 4);
            $checkIn = Carbon::create($year, $month, $checkInDay);
            $checkOut = $checkIn->copy()->addDays($nights);

            // created_at a few days before check-in (simulate advance booking)
            $advanceDays = rand(1, 7);
            $createdAt = $checkIn->copy()->subDays($advanceDays);
            // Make sure created_at is in the target month for revenue grouping
            if ($createdAt->month !== $month || $createdAt->year !== $year) {
                $createdAt = Carbon::create($year, $month, 1)->addHours(rand(0, 23));
            }

            $quantity = rand(1, 2);
            $unitPrice = (float) $roomType->nightly_rate;
            $total = $unitPrice * $nights * $quantity;

            $deposit = null;
            if (in_array($status, ['confirmed', 'checked_in', 'checked_out'])) {
                $deposit = $total * 0.5;
            }

            $paymentStatus = match ($status) {
                'checked_out', 'confirmed', 'checked_in' => 'success',
                'cancelled' => 'failed',
                default => 'pending',
            };

            $paymentMethod = ['cash', 'transfer', 'card'][rand(0, 2)];

            $booking = Booking::create([
                'booking_code' => 'BK' . strtoupper(Str::random(6)),
                'customer_id' => $customer->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guest_count' => rand(1, $roomType->max_guests),
                'status' => $status,
                'total_amount' => $total,
                'deposit' => $deposit,
                'notes' => $this->randomNote($status, $month),
            ]);

            // Override created_at / updated_at to the historical date
            $booking->created_at = $createdAt;
            $booking->updated_at = $createdAt->copy()->addHours(rand(0, 12));
            $booking->saveQuietly();

            BookingDetail::create([
                'booking_id' => $booking->id,
                'room_type_id' => $roomType->id,
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'nights' => $nights,
            ]);

            $payment = Payment::create([
                'booking_id' => $booking->id,
                'method' => $paymentMethod,
                'amount' => $total,
                'status' => $paymentStatus,
                'paid_at' => ($paymentStatus === 'success') ? $createdAt->copy()->addHours(rand(1, 4)) : null,
            ]);

            // Override payment timestamps too
            $payment->created_at = $createdAt;
            $payment->updated_at = $createdAt->copy()->addHours(rand(0, 6));
            $payment->saveQuietly();
        }
    }

    private function randomNote(string $status, int $month): string
    {
        $notes = [
            'checked_out' => [
                'Khách hài lòng, hẹn quay lại',
                'Trải nghiệm tốt, đánh giá 5 sao',
                'Khách doanh nghiệp, thanh toán công ty',
                'Đặt qua website, đã checkout suôn sẻ',
                'Khách du lịch gia đình',
                'Cặp đôi kỷ niệm, tặng hoa',
                'Nhóm bạn đi chơi cuối tuần',
                'Khách nước ngoài, communication tốt',
            ],
            'confirmed' => [
                'Đã xác nhận, chờ ngày nhận phòng',
                'Thanh toán đặt cọc 50%',
                'Đặt qua hotline, xác nhận nhanh',
            ],
            'pending' => [
                'Mới đặt, chờ xác nhận',
                'Đặt online, chờ thanh toán',
            ],
            'cancelled' => [
                'Khách hủy do thay đổi lịch trình',
                'Hủy vì lý do cá nhân',
                'Thay đổi điểm đến, đã hoàn tiền',
            ],
        ];

        $monthNames = [1 => 'tháng 1', 2 => 'tháng 2', 3 => 'tháng 3', 4 => 'tháng 4', 5 => 'tháng 5', 6 => 'tháng 6', 7 => 'tháng 7', 8 => 'tháng 8', 9 => 'tháng 9', 10 => 'tháng 10', 11 => 'tháng 11', 12 => 'tháng 12'];
        $pool = $notes[$status] ?? $notes['checked_out'];
        return $pool[array_rand($pool)] . ' — ' . ($monthNames[$month] ?? '');
    }
}
