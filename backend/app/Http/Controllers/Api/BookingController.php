<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Customer;
use App\Services\BookingExpiryService;
use App\Services\BookingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BookingExpiryService $bookingExpiry,
        protected BookingService $bookingService,
    ) {}

    public function store(CreateBookingRequest $request): JsonResponse
    {
        $user = $request->user();

        // Find or create customer
        $customer = Customer::firstOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $request->customer_name ?? $user->name,
                'phone' => $request->customer_phone ?? $user->phone,
                'email' => $request->customer_email ?? $user->email,
            ]
        );

        $customer->update([
            'full_name' => $request->customer_name ?? $customer->full_name,
            'phone' => $request->customer_phone ?? $customer->phone,
            'email' => $request->customer_email ?? $customer->email,
        ]);

        try {
            $booking = $this->bookingService->createBooking([
                'customer_id' => $customer->id,
                'check_in' => $request->check_in,
                'check_out' => $request->check_out,
                'guest_count' => $request->guest_count,
                'notes' => $request->notes,
                'payment_method' => $request->payment_method ?? 'transfer',
                'rooms' => $request->rooms,
            ]);

            return $this->success(new BookingResource($booking), 'Đặt phòng thành công.', 201);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->bookingExpiry->expirePendingBookings();

        $customer = Customer::where('user_id', $request->user()->id)->first();

        if (!$customer) {
            $bookings = Booking::query()->whereRaw('1 = 0')->paginate(10);

            return $this->paginated($bookings, data: BookingResource::collection($bookings->getCollection()));
        }

        $bookings = Booking::where('customer_id', $customer->id)
            ->with('details.roomType.homestay', 'details.room', 'details.assignedRooms', 'payments', 'customer', 'review')
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->paginated($bookings, data: BookingResource::collection($bookings->getCollection()));
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        $this->bookingExpiry->expirePendingBookings();

        $customer = Customer::where('user_id', $request->user()->id)->first();

        if (!$customer || $booking->customer_id !== $customer->id) {
            return $this->error('Không tìm thấy đơn đặt phòng.', 404);
        }

        $booking->load('details.roomType.homestay', 'details.room', 'details.assignedRooms', 'payments', 'customer', 'review');

        return $this->success(new BookingResource($booking));
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $customer = Customer::where('user_id', $request->user()->id)->first();

        if (!$customer || $booking->customer_id !== $customer->id) {
            return $this->error('Không tìm thấy đơn đặt phòng.', 404);
        }

        try {
            $booking = $this->bookingService->cancelBooking($booking);
            return $this->success(new BookingResource($booking), 'Đã hủy đặt phòng.');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
