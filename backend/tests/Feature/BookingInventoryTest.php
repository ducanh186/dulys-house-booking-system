<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\Payment;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingInventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_booking_reserves_inventory_until_it_expires(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $homestay = $this->createHomestay();
        $roomType = $this->createRoomType($homestay);

        $this->createRoom($roomType, 'P101');
        $this->createRoom($roomType, 'P102');

        $payload = $this->bookingPayload($roomType->id, 2);

        $response = $this->postJson('/api/bookings', $payload)
            ->assertCreated();

        $firstBookingId = $response->json('data.id');
        $this->assertNotNull($response->json('data.expires_at'));

        $this->postJson('/api/bookings', $this->bookingPayload($roomType->id, 1))
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        Booking::findOrFail($firstBookingId)->update([
            'expires_at' => now()->subMinute(),
        ]);

        $retry = $this->postJson('/api/bookings', $this->bookingPayload($roomType->id, 1))
            ->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'id' => $firstBookingId,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $firstBookingId,
            'status' => 'failed',
        ]);

        $this->assertSame('pending', $retry->json('data.status'));
    }

    public function test_admin_check_in_assigns_all_reserved_rooms_and_check_out_releases_them(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $guest = User::factory()->create();
        $customer = Customer::create([
            'user_id' => $guest->id,
            'full_name' => 'Nguyen Van A',
            'phone' => '0900000000',
            'email' => $guest->email,
        ]);

        $homestay = $this->createHomestay();
        $roomType = $this->createRoomType($homestay);
        $roomA = $this->createRoom($roomType, 'P201');
        $roomB = $this->createRoom($roomType, 'P202');

        $booking = Booking::create([
            'booking_code' => 'BKCHECK',
            'customer_id' => $customer->id,
            'check_in' => now()->addDay(),
            'check_out' => now()->addDays(3),
            'guest_count' => 4,
            'status' => 'confirmed',
            'total_amount' => 2000000,
        ]);

        $detail = BookingDetail::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'unit_price' => 1000000,
            'quantity' => 2,
            'nights' => 1,
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'method' => 'transfer',
            'amount' => 2000000,
            'status' => 'pending',
        ]);

        $this->patchJson("/api/admin/bookings/{$booking->id}/check-in")
            ->assertOk()
            ->assertJsonPath('data.status', 'checked_in');

        $this->assertDatabaseCount('booking_detail_rooms', 2);
        $this->assertDatabaseHas('booking_detail_rooms', [
            'booking_detail_id' => $detail->id,
            'room_id' => $roomA->id,
        ]);
        $this->assertDatabaseHas('booking_detail_rooms', [
            'booking_detail_id' => $detail->id,
            'room_id' => $roomB->id,
        ]);
        $this->assertDatabaseHas('rooms', ['id' => $roomA->id, 'status' => 'occupied']);
        $this->assertDatabaseHas('rooms', ['id' => $roomB->id, 'status' => 'occupied']);

        $this->patchJson("/api/admin/bookings/{$booking->id}/check-out")
            ->assertOk()
            ->assertJsonPath('data.status', 'checked_out');

        $this->assertDatabaseHas('rooms', [
            'id' => $roomA->id,
            'status' => 'available',
            'cleanliness' => 'dirty',
        ]);
        $this->assertDatabaseHas('rooms', [
            'id' => $roomB->id,
            'status' => 'available',
            'cleanliness' => 'dirty',
        ]);
        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'status' => 'success',
        ]);
    }

    public function test_my_bookings_endpoint_returns_stable_paginated_shape_with_contract_fields(): void
    {
        $user = User::factory()->create();
        $customer = Customer::create([
            'user_id' => $user->id,
            'full_name' => 'Tran Thi B',
            'phone' => '0911111111',
            'email' => $user->email,
        ]);

        $homestay = $this->createHomestay(['name' => 'Duly House Test']);
        $roomType = $this->createRoomType($homestay, ['name' => 'Family']);
        $booking = Booking::create([
            'booking_code' => 'BKLIST1',
            'customer_id' => $customer->id,
            'check_in' => now()->addDay(),
            'check_out' => now()->addDays(2),
            'guest_count' => 2,
            'status' => 'confirmed',
            'total_amount' => 900000,
        ]);

        BookingDetail::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'unit_price' => 900000,
            'quantity' => 1,
            'nights' => 1,
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'method' => 'transfer',
            'amount' => 900000,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.booking_code', 'BKLIST1')
            ->assertJsonPath('data.0.customer.name', 'Tran Thi B')
            ->assertJsonPath('data.0.homestay.name', 'Duly House Test')
            ->assertJsonPath('data.0.check_in_date', $booking->check_in->toDateString())
            ->assertJsonPath('meta.total', 1);

        $this->getJson('/api/bookings?booking_id=' . $booking->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $booking->id);

        $emptyUser = User::factory()->create();
        Sanctum::actingAs($emptyUser);

        $this->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('meta.total', 0);
    }

    private function bookingPayload(string $roomTypeId, int $quantity): array
    {
        return [
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(7)->toDateString(),
            'guest_count' => max(1, $quantity * 2),
            'customer_name' => 'Le Thi Test',
            'customer_phone' => '0988888888',
            'customer_email' => 'guest@example.com',
            'rooms' => [
                [
                    'room_type_id' => $roomTypeId,
                    'quantity' => $quantity,
                ],
            ],
        ];
    }

    private function createHomestay(array $overrides = []): Homestay
    {
        return Homestay::create(array_merge([
            'name' => 'Duly House',
            'address' => '123 Test Street',
            'hotline' => '0901234567',
            'email' => 'stay@example.com',
            'is_active' => true,
        ], $overrides));
    }

    private function createRoomType(Homestay $homestay, array $overrides = []): RoomType
    {
        return RoomType::create(array_merge([
            'homestay_id' => $homestay->id,
            'name' => 'Standard',
            'nightly_rate' => 1000000,
            'max_guests' => 4,
            'is_active' => true,
        ], $overrides));
    }

    private function createRoom(RoomType $roomType, string $code, array $overrides = []): Room
    {
        return Room::create(array_merge([
            'room_type_id' => $roomType->id,
            'room_code' => $code,
            'status' => 'available',
            'cleanliness' => 'clean',
        ], $overrides));
    }
}
