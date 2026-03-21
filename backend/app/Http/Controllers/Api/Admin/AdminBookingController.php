<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingExpiryService;
use App\Services\BookingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BookingExpiryService $bookingExpiry,
        protected BookingService $bookingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->bookingExpiry->expirePendingBookings();

        $query = Booking::with('customer', 'details.roomType.homestay', 'details.room', 'details.assignedRooms', 'payments');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('from')) {
            $query->whereDate('check_in', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->whereDate('check_out', '<=', $request->to);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('full_name', 'like', "%{$search}%"));
            });
        }

        $bookings = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginated($bookings, data: BookingResource::collection($bookings->getCollection()));
    }

    public function show(Booking $booking): JsonResponse
    {
        $this->bookingExpiry->expirePendingBookings();

        $booking->load('customer', 'staff', 'details.roomType.homestay', 'details.room', 'details.assignedRooms', 'payments');

        return $this->success(new BookingResource($booking));
    }

    public function confirm(Booking $booking): JsonResponse
    {
        try {
            $booking = $this->bookingService->confirmBooking($booking);
            return $this->success(new BookingResource($booking), 'Đã xác nhận đơn đặt phòng.');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function checkIn(Request $request, Booking $booking): JsonResponse
    {
        $staffId = null;
        if ($request->user()->staff) {
            $staffId = $request->user()->staff->id;
        }

        $roomAssignments = $request->get('room_assignments', []);

        try {
            $booking = $this->bookingService->checkIn($booking, $staffId, $roomAssignments);
            return $this->success(new BookingResource($booking), 'Check-in thành công.');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function checkOut(Booking $booking): JsonResponse
    {
        try {
            $booking = $this->bookingService->checkOut($booking);
            return $this->success(new BookingResource($booking), 'Check-out thành công.');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function cancel(Booking $booking): JsonResponse
    {
        try {
            $booking = $this->bookingService->cancelBooking($booking);
            return $this->success(new BookingResource($booking), 'Đã hủy đơn đặt phòng.');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
