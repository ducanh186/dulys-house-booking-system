<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\Payment;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingReportEnhancementTest extends TestCase
{
    use RefreshDatabase;

    public function test_testing_environment_allows_repeated_login_attempts_for_local_uat(): void
    {
        User::factory()->create([
            'email' => 'uat-login@example.com',
            'password' => 'password',
        ]);

        for ($attempt = 1; $attempt <= 8; $attempt++) {
            $this->postJson('/api/auth/login', [
                'email' => 'uat-login@example.com',
                'password' => 'password',
            ])->assertOk();
        }
    }

    public function test_staff_can_create_offline_booking_for_walk_in_customer(): void
    {
        [$homestay, $roomType] = $this->createInventory();
        $staffUser = User::factory()->create(['role' => 'staff']);
        $staff = $staffUser->staff ?? Staff::create([
                'user_id' => $staffUser->id,
                'full_name' => 'Nhan Vien Le Tan',
                'phone' => '0901111222',
                'email' => $staffUser->email,
                'role_title' => 'Le tan',
                'is_active' => true,
            ]);

        Sanctum::actingAs($staffUser);

        $response = $this->postJson('/api/admin/bookings/offline', [
            'check_in' => now()->addDays(3)->toDateString(),
            'check_out' => now()->addDays(5)->toDateString(),
            'guest_count' => 2,
            'customer_name' => 'Khach Walk In',
            'customer_phone' => '0903333444',
            'customer_email' => 'walkin@example.com',
            'payment_method' => 'transfer',
            'rooms' => [
                ['room_type_id' => $roomType->id, 'quantity' => 1],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_payment')
            ->assertJsonPath('data.customer.full_name', 'Khach Walk In');

        $this->assertDatabaseHas('customers', [
            'email' => 'walkin@example.com',
            'phone' => '0903333444',
            'user_id' => null,
        ]);

        $bookingId = $response->json('data.id');
        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'staff_id' => $staff->id,
            'status' => 'pending_payment',
        ]);
        $this->assertDatabaseHas('payments', [
            'booking_id' => $bookingId,
            'method' => 'transfer',
            'status' => 'pending',
        ]);
    }

    public function test_admin_booking_list_can_filter_by_room_type_and_homestay(): void
    {
        [$firstHomestay, $firstRoomType] = $this->createInventory('Duly House A', 'Deluxe');
        [$secondHomestay, $secondRoomType] = $this->createInventory('Duly House B', 'Suite');
        $firstBooking = $this->createPaidBooking($firstRoomType, now()->subDays(5), now()->subDays(3));
        $this->createPaidBooking($secondRoomType, now()->subDays(4), now()->subDays(2));

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->getJson('/api/admin/bookings?' . http_build_query([
            'room_type_id' => $firstRoomType->id,
            'homestay_id' => $firstHomestay->id,
        ]));

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $firstBooking->id)
            ->assertJsonPath('data.0.room_type.id', $firstRoomType->id);
    }

    public function test_admin_can_get_revenue_grouped_by_supported_dimensions(): void
    {
        [$homestay, $roomType] = $this->createInventory('Duly House Report', 'Penthouse');
        $booking = $this->createPaidBooking($roomType, now()->subMonth()->startOfMonth()->addDays(2), now()->subMonth()->startOfMonth()->addDays(4), [
            'customer_name' => 'Nguyen Van Khach',
        ]);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        foreach (['homestay', 'customer', 'room_type', 'month', 'quarter'] as $dimension) {
            $response = $this->getJson('/api/admin/reports/revenue-grouped?' . http_build_query([
                'dimension' => $dimension,
                'from' => now()->subMonths(2)->toDateString(),
                'to' => now()->toDateString(),
            ]));

            $response
                ->assertOk()
                ->assertJsonPath('data.dimension', $dimension)
                ->assertJsonPath('data.rows.0.booking_count', 1);

            $this->assertEquals((float) $booking->total_amount, (float) $response->json('data.rows.0.total_revenue'));
        }
    }

    public function test_guest_count_over_four_is_rejected(): void
    {
        [, $roomType] = $this->createInventory();
        Sanctum::actingAs(User::factory()->create(['role' => 'guest']));

        $this->postJson('/api/bookings', [
            'check_in' => now()->addDays(7)->toDateString(),
            'check_out' => now()->addDays(9)->toDateString(),
            'guest_count' => 5,
            'customer_name' => 'Guest Over Limit',
            'customer_phone' => '0909999888',
            'customer_email' => 'over-limit@example.com',
            'rooms' => [
                ['room_type_id' => $roomType->id, 'quantity' => 1],
            ],
        ])->assertStatus(422);
    }

    private function createInventory(string $homestayName = 'Duly House Test', string $roomTypeName = 'Standard'): array
    {
        $homestay = Homestay::create([
            'name' => $homestayName,
            'address' => '123 Test Street',
            'hotline' => '0901234567',
            'email' => Str::slug($homestayName) . '@example.com',
            'is_active' => true,
        ]);

        $roomType = RoomType::create([
            'homestay_id' => $homestay->id,
            'name' => $roomTypeName,
            'nightly_rate' => 500000,
            'max_guests' => 4,
            'is_active' => true,
        ]);

        Room::create([
            'room_type_id' => $roomType->id,
            'room_code' => strtoupper(Str::random(4)),
            'status' => 'available',
            'cleanliness' => 'clean',
        ]);

        return [$homestay, $roomType];
    }

    private function createPaidBooking(RoomType $roomType, $checkIn, $checkOut, array $overrides = []): Booking
    {
        $customer = Customer::create([
            'full_name' => $overrides['customer_name'] ?? 'Guest User',
            'phone' => $overrides['customer_phone'] ?? '0900000000',
            'email' => $overrides['customer_email'] ?? Str::random(8) . '@example.com',
        ]);

        $nights = $checkIn->diffInDays($checkOut);
        $amount = 500000 * $nights;
        $booking = Booking::create([
            'booking_code' => 'BK' . strtoupper(Str::random(6)),
            'customer_id' => $customer->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guest_count' => 2,
            'status' => 'checked_out',
            'total_amount' => $amount,
        ]);

        BookingDetail::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'unit_price' => 500000,
            'quantity' => 1,
            'nights' => $nights,
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'method' => 'transfer',
            'amount' => $amount,
            'status' => 'success',
            'paid_at' => $checkOut,
        ]);

        return $booking;
    }
}
