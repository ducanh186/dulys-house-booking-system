<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\Payment;
use App\Models\RoomType;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::all();
        $homestays = Homestay::with('roomTypes')->get();

        if ($customers->isEmpty() || $homestays->isEmpty()) {
            return;
        }

        // ================================================================
        // Nhóm 1: Booking PENDING (chờ xác nhận) — 3 booking
        // ================================================================
        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Nẵng",
            'room_type_name' => 'Standard',
            'customer_idx' => 0,
            'check_in' => Carbon::now()->addDays(5),
            'check_out' => Carbon::now()->addDays(7),
            'status' => 'pending',
            'guest_count' => 2,
            'notes' => 'Đặt online, chờ xác nhận',
            'payment_method' => 'transfer',
            'payment_status' => 'pending',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Phú Quốc",
            'room_type_name' => 'Pool Villa',
            'customer_idx' => 2,
            'check_in' => Carbon::now()->addDays(14),
            'check_out' => Carbon::now()->addDays(17),
            'status' => 'pending',
            'guest_count' => 5,
            'quantity' => 1,
            'notes' => 'Kỷ niệm ngày cưới, cần trang trí phòng',
            'payment_method' => 'card',
            'payment_status' => 'pending',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Lạt",
            'room_type_name' => 'Dorm (4 giường)',
            'customer_idx' => 4,
            'check_in' => Carbon::now()->addDays(10),
            'check_out' => Carbon::now()->addDays(12),
            'status' => 'pending',
            'guest_count' => 4,
            'quantity' => 1,
            'notes' => 'Nhóm bạn đi phượt cuối tuần',
            'payment_method' => 'transfer',
            'payment_status' => 'pending',
        ]);

        // ================================================================
        // Nhóm 2: Booking CONFIRMED (đã xác nhận, chưa check-in) — 3 booking
        // ================================================================
        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Nẵng",
            'room_type_name' => 'Deluxe Sea View',
            'customer_idx' => 1,
            'check_in' => Carbon::now()->addDays(1),
            'check_out' => Carbon::now()->addDays(4),
            'status' => 'confirmed',
            'guest_count' => 2,
            'notes' => 'Đã thanh toán 50% đặt cọc',
            'deposit' => null, // sẽ tính tự động
            'payment_method' => 'transfer',
            'payment_status' => 'success',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Hội An",
            'room_type_name' => 'Heritage Suite',
            'customer_idx' => 3,
            'check_in' => Carbon::now()->addDays(2),
            'check_out' => Carbon::now()->addDays(5),
            'status' => 'confirmed',
            'guest_count' => 2,
            'notes' => 'Cặp đôi du lịch, yêu cầu phòng yên tĩnh',
            'payment_method' => 'card',
            'payment_status' => 'success',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Phú Quốc",
            'room_type_name' => 'Bungalow Beach Front',
            'customer_idx' => 5, // walk-in customer
            'check_in' => Carbon::now()->addDays(3),
            'check_out' => Carbon::now()->addDays(6),
            'status' => 'confirmed',
            'guest_count' => 2,
            'quantity' => 2, // 2 phòng
            'notes' => 'Đặt qua điện thoại, 2 bungalow cạnh nhau',
            'payment_method' => 'cash',
            'payment_status' => 'pending',
        ]);

        // ================================================================
        // Nhóm 3: Booking CHECKED_IN (đang ở) — 3 booking
        // ================================================================
        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Nẵng",
            'room_type_name' => 'Family Room',
            'customer_idx' => 0,
            'check_in' => Carbon::now()->subDay(),
            'check_out' => Carbon::now()->addDays(2),
            'status' => 'checked_in',
            'guest_count' => 4,
            'notes' => 'Gia đình 4 người, có trẻ nhỏ',
            'payment_method' => 'transfer',
            'payment_status' => 'success',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Hội An",
            'room_type_name' => 'Standard',
            'customer_idx' => 6, // walk-in
            'check_in' => Carbon::now(),
            'check_out' => Carbon::now()->addDays(3),
            'status' => 'checked_in',
            'guest_count' => 2,
            'notes' => 'Khách quen quay lại, giảm 10%',
            'payment_method' => 'cash',
            'payment_status' => 'pending',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Lạt",
            'room_type_name' => 'Deluxe Pine View',
            'customer_idx' => 2,
            'check_in' => Carbon::now()->subDays(2),
            'check_out' => Carbon::now()->addDay(),
            'status' => 'checked_in',
            'guest_count' => 2,
            'notes' => 'Cặp đôi honeymoon',
            'payment_method' => 'card',
            'payment_status' => 'success',
        ]);

        // ================================================================
        // Nhóm 4: Booking CHECKED_OUT (đã trả phòng) — 3 booking
        // ================================================================
        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Nẵng",
            'room_type_name' => 'VIP Suite',
            'customer_idx' => 3,
            'check_in' => Carbon::now()->subDays(5),
            'check_out' => Carbon::now()->subDays(2),
            'status' => 'checked_out',
            'guest_count' => 2,
            'notes' => 'Khách VIP, cần ghi nhận feedback tốt',
            'payment_method' => 'card',
            'payment_status' => 'success',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Phú Quốc",
            'room_type_name' => 'Family Bungalow',
            'customer_idx' => 1,
            'check_in' => Carbon::now()->subDays(7),
            'check_out' => Carbon::now()->subDays(4),
            'status' => 'checked_out',
            'guest_count' => 5,
            'notes' => 'Gia đình đi nghỉ lễ',
            'payment_method' => 'transfer',
            'payment_status' => 'success',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Hội An",
            'room_type_name' => 'Deluxe Garden',
            'customer_idx' => 4,
            'check_in' => Carbon::now()->subDays(10),
            'check_out' => Carbon::now()->subDays(7),
            'status' => 'checked_out',
            'guest_count' => 2,
            'notes' => 'Du khách Nhật, rất hài lòng',
            'payment_method' => 'card',
            'payment_status' => 'success',
        ]);

        // ================================================================
        // Nhóm 5: Booking CANCELLED — 2 booking
        // ================================================================
        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Nẵng",
            'room_type_name' => 'Standard',
            'customer_idx' => 4,
            'check_in' => Carbon::now()->addDays(20),
            'check_out' => Carbon::now()->addDays(22),
            'status' => 'cancelled',
            'guest_count' => 1,
            'notes' => 'Khách hủy do thay đổi lịch trình',
            'payment_method' => 'transfer',
            'payment_status' => 'failed',
        ]);

        $this->createBooking($customers, $homestays, [
            'homestay_name' => "Duly's House Đà Lạt",
            'room_type_name' => 'Penthouse',
            'customer_idx' => 3,
            'check_in' => Carbon::now()->addDays(8),
            'check_out' => Carbon::now()->addDays(10),
            'status' => 'cancelled',
            'guest_count' => 3,
            'notes' => 'Hủy do thời tiết xấu',
            'payment_method' => 'card',
            'payment_status' => 'failed',
        ]);
    }

    private function createBooking($customers, $homestays, array $data): void
    {
        $customer = $customers[$data['customer_idx'] % $customers->count()];

        // Tìm homestay và room type
        $homestay = $homestays->firstWhere('name', $data['homestay_name']);
        if (!$homestay) return;

        $roomType = $homestay->roomTypes->firstWhere('name', $data['room_type_name']);
        if (!$roomType) return;

        $nights = Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
        $nights = max($nights, 1);
        $quantity = $data['quantity'] ?? 1;
        $unitPrice = (float) $roomType->nightly_rate;
        $total = $unitPrice * $nights * $quantity;

        // Deposit = 50% cho confirmed+
        $deposit = null;
        if (in_array($data['status'], ['confirmed', 'checked_in', 'checked_out'])) {
            $deposit = $total * 0.5;
        }

        $booking = Booking::create([
            'booking_code' => 'BK' . strtoupper(Str::random(6)),
            'customer_id' => $customer->id,
            'check_in' => $data['check_in'],
            'check_out' => $data['check_out'],
            'guest_count' => $data['guest_count'],
            'status' => $data['status'],
            'total_amount' => $total,
            'deposit' => $data['deposit'] ?? $deposit,
            'notes' => $data['notes'],
        ]);

        BookingDetail::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'nights' => $nights,
        ]);

        $paymentAmount = ($data['payment_status'] === 'success') ? $total : $total;

        Payment::create([
            'booking_id' => $booking->id,
            'method' => $data['payment_method'],
            'amount' => $paymentAmount,
            'status' => $data['payment_status'],
            'paid_at' => ($data['payment_status'] === 'success') ? now() : null,
        ]);
    }
}
