<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminFeedbackReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_get_printable_occupancy_detail_report(): void
    {
        $admin = $this->createAdminUser();
        Sanctum::actingAs($admin);

        $homestay = $this->createHomestay(['name' => 'Duly House Đội Cấn']);
        $roomType = $this->createRoomType($homestay, ['name' => 'Standard']);
        $roomA = $this->createRoom($roomType, 'P101');
        $this->createRoom($roomType, 'P102');
        $suspendedRoom = $this->createRoom($roomType, 'P103');
        $suspendedRoom->delete();

        $inactiveRoomType = $this->createRoomType($homestay, ['name' => 'Paused', 'is_active' => false]);
        $this->createRoom($inactiveRoomType, 'P999');

        $from = now()->addDays(10)->startOfDay();
        $to = $from->copy()->addDays(3);

        $customer = $this->createCustomer();
        $booking = $this->createBooking($customer, $from, $from->copy()->addDays(2), 'confirmed');
        $detail = $this->createBookingDetail($booking, $roomType);
        $detail->assignedRooms()->attach($roomA->id);

        $response = $this->getJson('/api/admin/reports/occupancy-detail?' . http_build_query([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'homestay_id' => $homestay->id,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('data.summary.total_rooms', 2)
            ->assertJsonPath('data.summary.total_used_days', 2)
            ->assertJsonPath('data.summary.period_days', 4)
            ->assertJsonPath('data.summary.average_occupancy', 25)
            ->assertJsonPath('data.rows.0.room_code', 'P101')
            ->assertJsonPath('data.rows.0.used_days', 2)
            ->assertJsonPath('data.rows.0.period_days', 4)
            ->assertJsonPath('data.rows.0.occupancy_rate', 50)
            ->assertJsonPath('data.rows.0.booking_count', 1)
            ->assertJsonPath('data.rows.1.room_code', 'P102')
            ->assertJsonPath('data.rows.1.occupancy_rate', 0);

        $roomCodes = collect($response->json('data.rows'))->pluck('room_code');
        $this->assertFalse($roomCodes->contains('P103'));
        $this->assertFalse($roomCodes->contains('P999'));
    }

    public function test_admin_can_filter_review_report_by_homestay_customer_room_and_rating(): void
    {
        $admin = $this->createAdminUser();
        Sanctum::actingAs($admin);

        $from = now()->subDays(7)->startOfDay();
        $to = now()->endOfDay();

        $homestay = $this->createHomestay(['name' => 'Duly House Âu Cơ']);
        $roomType = $this->createRoomType($homestay, ['name' => 'Deluxe']);
        $room = $this->createRoom($roomType, 'A201');
        $customer = $this->createCustomer(['full_name' => 'Nguyễn Văn Khách']);
        $booking = $this->createBooking($customer, now()->subDays(5), now()->subDays(3), 'checked_out');
        $detail = $this->createBookingDetail($booking, $roomType);
        $detail->assignedRooms()->attach($room->id);
        $review = Review::create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'homestay_id' => $homestay->id,
            'rating' => 5,
            'comment' => 'Phòng sạch và nhân viên hỗ trợ nhanh.',
        ]);
        $review->forceFill(['created_at' => now()->subDay(), 'updated_at' => now()->subDay()])->saveQuietly();

        $otherHomestay = $this->createHomestay(['name' => 'Duly House Long Biên']);
        $otherRoomType = $this->createRoomType($otherHomestay, ['name' => 'Standard']);
        $otherRoom = $this->createRoom($otherRoomType, 'B101');
        $otherCustomer = $this->createCustomer(['full_name' => 'Lê Thị Mai']);
        $otherBooking = $this->createBooking($otherCustomer, now()->subDays(4), now()->subDays(2), 'checked_out');
        $otherDetail = $this->createBookingDetail($otherBooking, $otherRoomType);
        $otherDetail->assignedRooms()->attach($otherRoom->id);
        Review::create([
            'booking_id' => $otherBooking->id,
            'customer_id' => $otherCustomer->id,
            'homestay_id' => $otherHomestay->id,
            'rating' => 3,
            'comment' => 'Ổn.',
        ]);

        $response = $this->getJson('/api/admin/reports/reviews?' . http_build_query([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'homestay_id' => $homestay->id,
            'customer_id' => $customer->id,
            'room_id' => $room->id,
            'rating' => 5,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('data.summary.total_reviews', 1)
            ->assertJsonPath('data.summary.average_rating', 5)
            ->assertJsonPath('data.summary.rating_counts.5', 1)
            ->assertJsonPath('data.reviews.0.customer_name', 'Nguyễn Văn Khách')
            ->assertJsonPath('data.reviews.0.homestay_name', 'Duly House Âu Cơ')
            ->assertJsonPath('data.reviews.0.room_codes.0', 'A201')
            ->assertJsonPath('data.reviews.0.rating', 5)
            ->assertJsonPath('data.reviews.0.comment', 'Phòng sạch và nhân viên hỗ trợ nhanh.');
    }

    public function test_payment_confirmation_notifies_guest_with_booking_id(): void
    {
        $admin = $this->createAdminUser();
        $guest = User::factory()->create(['role' => 'guest']);
        $customer = $this->createCustomer([
            'user_id' => $guest->id,
            'email' => $guest->email,
        ]);
        $homestay = $this->createHomestay();
        $roomType = $this->createRoomType($homestay);
        $this->createRoom($roomType, 'N101');
        $booking = $this->createBooking($customer, now()->addDay(), now()->addDays(2), 'pending');
        $this->createBookingDetail($booking, $roomType);
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'method' => 'transfer',
            'amount' => 500000,
            'status' => 'proof_uploaded',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/payments/{$payment->id}/confirm")
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $guest->id,
            'type' => 'payment_confirmed',
            'title' => 'Thanh toán đã được xác nhận',
        ]);

        $notification = $guest->notifications()->where('type', 'payment_confirmed')->first();
        $this->assertSame($booking->id, $notification->data['booking_id']);
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

    private function createAdminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createRoomType(Homestay $homestay, array $overrides = []): RoomType
    {
        return RoomType::create(array_merge([
            'homestay_id' => $homestay->id,
            'name' => 'Standard',
            'nightly_rate' => 500000,
            'max_guests' => 4,
            'is_active' => true,
        ], $overrides));
    }

    private function createRoom(RoomType $roomType, string $code): Room
    {
        return Room::create([
            'room_type_id' => $roomType->id,
            'room_code' => $code,
            'status' => 'available',
            'cleanliness' => 'clean',
        ]);
    }

    private function createCustomer(array $overrides = []): Customer
    {
        $user = isset($overrides['user_id'])
            ? User::find($overrides['user_id'])
            : User::factory()->create(['role' => 'guest']);

        return Customer::create(array_merge([
            'user_id' => $user?->id,
            'full_name' => 'Guest User',
            'phone' => '0900000000',
            'email' => $user?->email ?? 'guest@example.com',
        ], $overrides));
    }

    private function createBooking(Customer $customer, $checkIn, $checkOut, string $status): Booking
    {
        return Booking::create([
            'booking_code' => 'BK' . strtoupper(Str::random(6)),
            'customer_id' => $customer->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guest_count' => 2,
            'status' => $status,
            'total_amount' => 500000,
        ]);
    }

    private function createBookingDetail(Booking $booking, RoomType $roomType): BookingDetail
    {
        return BookingDetail::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'unit_price' => 500000,
            'quantity' => 1,
            'nights' => 1,
        ]);
    }
}
