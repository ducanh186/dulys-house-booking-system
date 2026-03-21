<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiContractAlignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_update_supports_email_password_and_customer_sync(): void
    {
        $existing = User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create(['email' => 'before@example.com']);

        Customer::create([
            'user_id' => $user->id,
            'full_name' => $user->name,
            'phone' => '0901234567',
            'email' => $user->email,
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/profile', [
            'email' => $existing->email,
        ])->assertStatus(422);

        $this->patchJson('/api/profile', [
            'password' => 'new-secret',
            'password_confirmation' => 'mismatch',
        ])->assertStatus(422);

        $this->patchJson('/api/profile', [
            'name' => 'Updated Name',
            'email' => 'after@example.com',
            'phone' => '0999999999',
            'password' => 'new-secret',
            'password_confirmation' => 'new-secret',
        ])
            ->assertOk()
            ->assertJsonPath('data.email', 'after@example.com')
            ->assertJsonPath('data.customer.email', 'after@example.com')
            ->assertJsonPath('data.customer.name', 'Updated Name');

        $user->refresh();

        $this->assertSame('Updated Name', $user->name);
        $this->assertSame('after@example.com', $user->email);
        $this->assertTrue(Hash::check('new-secret', $user->password));
        $this->assertDatabaseHas('customers', [
            'user_id' => $user->id,
            'full_name' => 'Updated Name',
            'email' => 'after@example.com',
            'phone' => '0999999999',
        ]);
    }

    public function test_admin_payment_create_uses_canonical_contract_and_returns_booking_customer_name(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $guest = User::factory()->create();
        $customer = Customer::create([
            'user_id' => $guest->id,
            'full_name' => 'Pham Van C',
            'phone' => '0902222222',
            'email' => $guest->email,
        ]);

        $homestay = Homestay::create([
            'name' => 'Duly Beach House',
            'address' => '456 Beach Road',
            'hotline' => '0901230000',
            'email' => 'beach@example.com',
            'is_active' => true,
        ]);

        $roomType = RoomType::create([
            'homestay_id' => $homestay->id,
            'name' => 'Ocean View',
            'nightly_rate' => 1500000,
            'max_guests' => 2,
            'is_active' => true,
        ]);

        $booking = Booking::create([
            'booking_code' => 'BKPAY1',
            'customer_id' => $customer->id,
            'check_in' => now()->addDay(),
            'check_out' => now()->addDays(2),
            'guest_count' => 2,
            'status' => 'confirmed',
            'total_amount' => 1500000,
        ]);

        BookingDetail::create([
            'booking_id' => $booking->id,
            'room_type_id' => $roomType->id,
            'unit_price' => 1500000,
            'quantity' => 1,
            'nights' => 1,
        ]);

        $this->postJson('/api/admin/payments', [
            'booking_id' => $booking->id,
            'amount' => 1500000,
            'method' => 'transfer',
        ])
            ->assertCreated()
            ->assertJsonPath('data.method', 'transfer')
            ->assertJsonPath('data.status', 'success')
            ->assertJsonPath('data.booking.booking_code', 'BKPAY1')
            ->assertJsonPath('data.booking.customer.name', 'Pham Van C');
    }

    public function test_admin_homestay_crud_returns_email_field(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/homestays', [
            'name' => 'Duly Mountain House',
            'address' => '789 Pine Street',
            'hotline' => '0907777777',
            'email' => 'mountain@example.com',
            'description' => 'Fresh air stay',
            'is_active' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'mountain@example.com');
    }
}
