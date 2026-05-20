<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Customer;
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

        $perPage = min(100, max(1, (int) $request->query('per_page', 15)));
        $bookings = $query->orderByDesc('created_at')->paginate($perPage);

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

    public function storeOffline(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guest_count' => 'required|integer|min:1|max:4',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'nullable|in:cash,transfer,card',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email',
            'rooms' => 'required|array|min:1',
            'rooms.*.room_type_id' => 'required|uuid|exists:room_types,id',
            'rooms.*.quantity' => 'required|integer|min:1|max:10',
        ]);

        $customer = Customer::query()
            ->whereNull('user_id')
            ->where(function (Builder $query) use ($validated) {
                if (!empty($validated['customer_email'])) {
                    $query->orWhere('email', $validated['customer_email']);
                }

                if (!empty($validated['customer_phone'])) {
                    $query->orWhere('phone', $validated['customer_phone']);
                }
            })
            ->first();

        if (!$customer) {
            $customer = Customer::create([
                'user_id' => null,
                'full_name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'] ?? null,
                'email' => $validated['customer_email'] ?? null,
            ]);
        } else {
            $customer->update([
                'full_name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'] ?? $customer->phone,
                'email' => $validated['customer_email'] ?? $customer->email,
            ]);
        }

        try {
            $booking = $this->bookingService->createBooking(array_merge($validated, [
                'customer_id' => $customer->id,
                'staff_id' => $request->user()->staff?->id,
            ]));

            return $this->success(
                new BookingResource($booking->load('customer', 'details.roomType.homestay', 'details.room', 'details.assignedRooms', 'payments')),
                'Đã tạo đơn đặt phòng qua nhân viên.',
                201,
            );
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
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

        if (!in_array('room_type_id', $except, true) && $request->filled('room_type_id')) {
            $query->whereHas('details', fn ($detailQuery) => $detailQuery
                ->where('room_type_id', $request->query('room_type_id')));
        }

        if (!in_array('homestay_id', $except, true) && $request->filled('homestay_id')) {
            $query->whereHas('details.roomType', fn ($roomTypeQuery) => $roomTypeQuery
                ->where('homestay_id', $request->query('homestay_id')));
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
