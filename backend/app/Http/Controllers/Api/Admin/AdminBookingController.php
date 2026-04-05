<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingExpiryService;
use App\Services\BookingService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
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
        $summaryQuery = Booking::query();

        $this->applyFilters($query, $request);
        $this->applyFilters($summaryQuery, $request, except: ['status', 'booking_id']);

        $statusCounts = $this->statusCounts($summaryQuery);

        $bookings = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginated(
            $bookings,
            data: BookingResource::collection($bookings->getCollection()),
            meta: [
                'summary' => [
                    'status_counts' => $statusCounts,
                ],
            ],
        );
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

    protected function applyFilters(Builder $query, Request $request, array $except = []): void
    {
        if (!in_array('booking_id', $except, true) && $request->filled('booking_id')) {
            $query->whereKey($request->query('booking_id'));
        }

        if (!in_array('status', $except, true) && $request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if (!in_array('from', $except, true) && $request->filled('from')) {
            $query->whereDate('check_in', '>=', $request->query('from'));
        }

        if (!in_array('to', $except, true) && $request->filled('to')) {
            $query->whereDate('check_out', '<=', $request->query('to'));
        }

        if (!in_array('search', $except, true) && $request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('full_name', 'like', "%{$search}%"));
            });
        }
    }

    protected function statusCounts(Builder $query): array
    {
        $defaults = [
            'pending' => 0,
            'pending_payment' => 0,
            'payment_review' => 0,
            'confirmed' => 0,
            'checked_in' => 0,
            'checked_out' => 0,
            'cancelled' => 0,
            'expired' => 0,
        ];

        $counts = $query
            ->get(['status'])
            ->groupBy('status')
            ->map(fn ($items) => $items->count())
            ->all();

        return array_merge($defaults, $counts);
    }
}
