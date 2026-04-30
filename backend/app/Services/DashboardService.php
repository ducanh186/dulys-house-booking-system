<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Room;
use Carbon\Carbon;

class DashboardService
{
    public function getSummary(): array
    {
        $today = Carbon::today();

        return [
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'checked_in_today' => Booking::where('status', 'checked_in')
                ->whereDate('check_in', $today)
                ->count(),
            'total_revenue' => Booking::whereIn('status', ['checked_out', 'checked_in', 'confirmed'])
                ->sum('total_amount'),
            'total_rooms' => Room::count(),
            'available_rooms' => Room::where('status', 'available')
                ->where('cleanliness', 'clean')
                ->count(),
            'occupied_rooms' => Room::where('status', 'occupied')->count(),
            'total_homestays' => Homestay::where('is_active', true)->count(),
            'total_customers' => Customer::count(),
        ];
    }

    public function getRevenueByPeriod(Carbon $from, Carbon $to): array
    {
        $bookings = Booking::whereIn('status', ['checked_out', 'checked_in', 'confirmed'])
            ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->get();

        $grouped = $bookings
            ->groupBy(fn (Booking $booking) => $booking->created_at->format('Y-m'))
            ->map(fn ($group, $month) => [
                'month' => $month,
                'revenue' => (float) $group->sum('total_amount'),
                'count' => $group->count(),
            ]);

        // Fill all months in the range so the chart always shows every month
        $result = [];
        $cursor = $from->copy()->startOfMonth();
        $end = $to->copy()->startOfMonth();

        while ($cursor->lte($end)) {
            $key = $cursor->format('Y-m');
            $result[] = $grouped->get($key, [
                'month' => $key,
                'revenue' => 0,
                'count' => 0,
            ]);
            $cursor->addMonth();
        }

        return $result;
    }

    public function getOccupancyReport(?string $homestayId, Carbon $from, Carbon $to): array
    {
        $query = Room::query();
        if ($homestayId) {
            $query->whereHas('roomType', fn ($q) => $q->where('homestay_id', $homestayId));
        }
        $totalRooms = $query->count();

        if ($totalRooms === 0) return [];

        $current = $from->copy();
        $data = [];

        while ($current->lte($to)) {
            $date = $current->toDateString();
            $nextDay = $current->copy()->addDay();

            $bookedQuery = BookingDetail::whereHas('booking', fn ($q) => $q
                ->inventoryHeld()
                ->overlapping($current, $nextDay));

            if ($homestayId) {
                $bookedQuery->whereHas('roomType', fn ($q) => $q->where('homestay_id', $homestayId));
            }

            $bookedRooms = (int) $bookedQuery->sum('quantity');
            $occupancy = min(100, round(($bookedRooms / $totalRooms) * 100, 1));

            $data[] = [
                'date' => $date,
                'total_rooms' => $totalRooms,
                'booked_rooms' => $bookedRooms,
                'occupancy' => $occupancy,
            ];

            $current->addDay();
        }

        return $data;
    }

    public function getOccupancyDetailReport(?string $homestayId, Carbon $from, Carbon $to): array
    {
        $periodStart = $from->copy()->startOfDay();
        $periodEnd = $to->copy()->startOfDay();
        $periodEndExclusive = $periodEnd->copy()->addDay();
        $periodDays = max(1, (int) $periodStart->diffInDays($periodEnd) + 1);

        $rooms = Room::query()
            ->with('roomType.homestay')
            ->whereHas('roomType', function ($query) use ($homestayId) {
                $query
                    ->where('is_active', true)
                    ->whereHas('homestay', fn ($homestayQuery) => $homestayQuery->where('is_active', true));

                if ($homestayId) {
                    $query->where('homestay_id', $homestayId);
                }
            })
            ->orderBy('room_code')
            ->get();

        $roomIds = $rooms->pluck('id');
        $usedDaysByRoom = $roomIds->mapWithKeys(fn ($id) => [$id => 0])->all();
        $bookingIdsByRoom = $roomIds->mapWithKeys(fn ($id) => [$id => []])->all();

        if ($roomIds->isNotEmpty()) {
            $details = BookingDetail::query()
                ->with('booking', 'assignedRooms')
                ->where(function ($query) use ($roomIds) {
                    $query
                        ->whereIn('room_id', $roomIds)
                        ->orWhereHas('assignedRooms', fn ($roomQuery) => $roomQuery->whereIn('rooms.id', $roomIds));
                })
                ->whereHas('booking', fn ($query) => $query
                    ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
                    ->where('check_in', '<', $periodEndExclusive)
                    ->where('check_out', '>', $periodStart))
                ->get();

            foreach ($details as $detail) {
                $booking = $detail->booking;
                if (!$booking) {
                    continue;
                }

                $bookingStart = $booking->check_in->copy()->startOfDay();
                $bookingEnd = $booking->check_out->copy()->startOfDay();
                $overlapStart = $bookingStart->greaterThan($periodStart) ? $bookingStart : $periodStart;
                $overlapEnd = $bookingEnd->lessThan($periodEndExclusive) ? $bookingEnd : $periodEndExclusive;
                $usedDays = max(0, (int) $overlapStart->diffInDays($overlapEnd));
                if ($usedDays === 0) {
                    continue;
                }

                $assignedRoomIds = $detail->assignedRooms->pluck('id');
                if ($assignedRoomIds->isEmpty() && $detail->room_id) {
                    $assignedRoomIds = collect([$detail->room_id]);
                }

                foreach ($assignedRoomIds as $roomId) {
                    if (!array_key_exists($roomId, $usedDaysByRoom)) {
                        continue;
                    }

                    $usedDaysByRoom[$roomId] += $usedDays;
                    $bookingIdsByRoom[$roomId][$booking->id] = true;
                }
            }
        }

        $rows = $rooms->map(function (Room $room) use ($usedDaysByRoom, $bookingIdsByRoom, $periodDays) {
            $usedDays = (int) ($usedDaysByRoom[$room->id] ?? 0);
            $occupancy = $periodDays > 0 ? round(($usedDays / $periodDays) * 100, 1) : 0;
            $bookingCount = count($bookingIdsByRoom[$room->id] ?? []);

            return [
                'homestay_id' => $room->roomType?->homestay?->id,
                'homestay_name' => $room->roomType?->homestay?->name,
                'room_type_id' => $room->room_type_id,
                'room_type_name' => $room->roomType?->name,
                'room_id' => $room->id,
                'room_code' => $room->room_code,
                'used_days' => $usedDays,
                'period_days' => $periodDays,
                'occupancy_rate' => $occupancy,
                'booking_count' => $bookingCount,
            ];
        })->values();

        $totalRooms = $rows->count();
        $totalUsedDays = (int) $rows->sum('used_days');
        $averageOccupancy = $totalRooms > 0
            ? round(($totalUsedDays / ($totalRooms * $periodDays)) * 100, 1)
            : 0;
        $highestRoom = $rows->sortByDesc('occupancy_rate')->first();
        $lowestRoom = $rows->sortBy('occupancy_rate')->first();

        return [
            'period' => [
                'from' => $periodStart->toDateString(),
                'to' => $periodEnd->toDateString(),
            ],
            'summary' => [
                'total_rooms' => $totalRooms,
                'period_days' => $periodDays,
                'total_used_days' => $totalUsedDays,
                'average_occupancy' => $averageOccupancy,
                'highest_room' => $highestRoom ? [
                    'room_code' => $highestRoom['room_code'],
                    'room_type_name' => $highestRoom['room_type_name'],
                    'occupancy_rate' => $highestRoom['occupancy_rate'],
                ] : null,
                'lowest_room' => $lowestRoom ? [
                    'room_code' => $lowestRoom['room_code'],
                    'room_type_name' => $lowestRoom['room_type_name'],
                    'occupancy_rate' => $lowestRoom['occupancy_rate'],
                ] : null,
            ],
            'rows' => $rows->all(),
        ];
    }

    public function getCancellationReport(Carbon $from, Carbon $to): array
    {
        $total = Booking::whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])->count();
        $cancelled = Booking::where('status', 'cancelled')
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->count();

        $recentCancellations = Booking::with('customer')
            ->where('status', 'cancelled')
            ->whereBetween('updated_at', [$from->startOfDay(), $to->endOfDay()])
            ->latest('updated_at')
            ->limit(20)
            ->get()
            ->map(fn ($b) => [
                'booking_code' => $b->booking_code,
                'customer_name' => $b->customer?->full_name,
                'total_amount' => $b->total_amount,
                'cancelled_at' => $b->updated_at->toDateTimeString(),
            ]);

        return [
            'total_bookings' => $total,
            'cancelled_count' => $cancelled,
            'cancellation_rate' => $total > 0 ? round(($cancelled / $total) * 100, 1) : 0,
            'recent_cancellations' => $recentCancellations,
        ];
    }

    public function getRevenueByHomestay(Carbon $from, Carbon $to): array
    {
        $homestays = Homestay::where('is_active', true)->get();

        return $homestays->map(function ($homestay) use ($from, $to) {
            $payments = Payment::where('status', 'success')
                ->whereHas('booking', fn ($q) => $q
                    ->whereHas('details.roomType', fn ($rq) => $rq->where('homestay_id', $homestay->id))
                    ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
                );

            $revenue = (float) $payments->sum('amount');
            $bookingCount = Booking::whereHas('details.roomType', fn ($q) => $q->where('homestay_id', $homestay->id))
                ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
                ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
                ->count();

            return [
                'homestay_id' => $homestay->id,
                'homestay_name' => $homestay->name,
                'total_revenue' => $revenue,
                'booking_count' => $bookingCount,
                'avg_booking_value' => $bookingCount > 0 ? round($revenue / $bookingCount, 0) : 0,
            ];
        })->values()->all();
    }

    public function getCustomerReport(Carbon $from, Carbon $to): array
    {
        $start = $from->copy()->startOfDay();
        $end = $to->copy()->endOfDay();

        $rangeBookings = Booking::query()
            ->whereNotNull('customer_id')
            ->whereBetween('created_at', [$start, $end])
            ->get();

        $customerIds = $rangeBookings->pluck('customer_id')->filter()->unique()->values();

        if ($customerIds->isEmpty()) {
            return [
                'summary' => [
                    'total_customers' => 0,
                    'returning_customers' => 0,
                    'repeat_rate' => 0,
                    'average_booking_value' => 0,
                ],
                'top_customers' => [],
                'segments' => [],
                'new_customers_timeseries' => $this->emptyCustomerTimeseries($start, $end),
            ];
        }

        $customers = Customer::query()
            ->whereIn('id', $customerIds)
            ->get()
            ->keyBy('id');

        $lifetimeStats = Booking::query()
            ->selectRaw('customer_id, COUNT(*) as booking_count, SUM(CASE WHEN status != ? THEN total_amount ELSE 0 END) as total_spent, MIN(created_at) as first_booking_at, MAX(created_at) as last_booking_at', ['cancelled'])
            ->whereIn('customer_id', $customerIds)
            ->groupBy('customer_id')
            ->get()
            ->keyBy('customer_id');

        $rangeStats = Booking::query()
            ->selectRaw('customer_id, COUNT(*) as booking_count, SUM(CASE WHEN status != ? THEN total_amount ELSE 0 END) as total_spent, MAX(created_at) as last_booking_at', ['cancelled'])
            ->whereIn('customer_id', $customerIds)
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('customer_id')
            ->get()
            ->keyBy('customer_id');

        $activeRangeBookings = $rangeBookings->where('status', '!=', 'cancelled');
        $returningCustomers = $lifetimeStats->filter(
            fn ($stat) => (int) $stat->booking_count > 1
        )->count();

        $segments = [
            'Khach moi' => 0,
            'Khach quay lai' => 0,
            'Khach than thiet' => 0,
        ];

        $newCustomersPerDate = [];

        foreach ($customerIds as $customerId) {
            $stat = $lifetimeStats->get($customerId);

            if (!$stat?->first_booking_at) {
                continue;
            }

            $firstBookingAt = Carbon::parse($stat->first_booking_at);
            $firstBookingDate = $firstBookingAt->toDateString();

            if ($firstBookingAt->betweenIncluded($start, $end)) {
                $segments['Khach moi']++;
                $newCustomersPerDate[$firstBookingDate] = ($newCustomersPerDate[$firstBookingDate] ?? 0) + 1;
                continue;
            }

            if ((int) $stat->booking_count >= 3) {
                $segments['Khach than thiet']++;
                continue;
            }

            $segments['Khach quay lai']++;
        }

        $topCustomers = $rangeStats
            ->sortByDesc(fn ($stat) => ((float) $stat->total_spent * 1000) + (int) $stat->booking_count)
            ->take(5)
            ->map(function ($stat, $customerId) use ($customers) {
                $customer = $customers->get($customerId);

                return [
                    'id' => $customerId,
                    'name' => $customer?->full_name ?? 'Khach hang',
                    'email' => $customer?->email,
                    'phone' => $customer?->phone,
                    'booking_count' => (int) $stat->booking_count,
                    'total_spent' => round((float) $stat->total_spent, 0),
                    'last_booking_at' => Carbon::parse($stat->last_booking_at)->toISOString(),
                ];
            })
            ->values()
            ->all();

        return [
            'summary' => [
                'total_customers' => $customerIds->count(),
                'new_customers' => array_sum($newCustomersPerDate),
                'returning_customers' => $returningCustomers,
                'repeat_rate' => $customerIds->count() > 0 ? round(($returningCustomers / $customerIds->count()) * 100, 1) : 0,
                'average_booking_value' => $activeRangeBookings->count() > 0
                    ? round($activeRangeBookings->avg('total_amount'), 0)
                    : 0,
            ],
            'top_customers' => $topCustomers,
            'segments' => collect($segments)
                ->map(fn ($value, $name) => [
                    'name' => $name,
                    'value' => $value,
                ])
                ->filter(fn ($segment) => $segment['value'] > 0)
                ->values()
                ->all(),
            'new_customers_timeseries' => $this->buildCustomerTimeseries($start, $end, $newCustomersPerDate),
        ];
    }

    public function getReviewReport(Carbon $from, Carbon $to, array $filters = []): array
    {
        $start = $from->copy()->startOfDay();
        $end = $to->copy()->endOfDay();

        $query = Review::query()
            ->with('customer', 'homestay', 'booking.details.room', 'booking.details.roomType', 'booking.details.assignedRooms')
            ->whereBetween('created_at', [$start, $end]);

        if (!empty($filters['homestay_id'])) {
            $query->where('homestay_id', $filters['homestay_id']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['rating'])) {
            $query->where('rating', (int) $filters['rating']);
        }

        if (!empty($filters['room_id'])) {
            $roomId = $filters['room_id'];
            $query->whereHas('booking.details', fn ($detailQuery) => $detailQuery
                ->where('room_id', $roomId)
                ->orWhereHas('assignedRooms', fn ($roomQuery) => $roomQuery->where('rooms.id', $roomId)));
        }

        $reviews = $query->latest()->get();
        $ratingCounts = collect(range(1, 5))
            ->mapWithKeys(fn ($rating) => [$rating => $reviews->where('rating', $rating)->count()])
            ->all();

        return [
            'summary' => [
                'total_reviews' => $reviews->count(),
                'average_rating' => $reviews->count() > 0 ? round((float) $reviews->avg('rating'), 1) : 0,
                'rating_counts' => $ratingCounts,
            ],
            'reviews' => $reviews->map(function (Review $review) {
                $roomCodes = $review->booking?->details
                    ?->flatMap(function (BookingDetail $detail) {
                        $assigned = $detail->assignedRooms->pluck('room_code');
                        if ($assigned->isNotEmpty()) {
                            return $assigned;
                        }

                        return $detail->room?->room_code ? [$detail->room->room_code] : [];
                    })
                    ->unique()
                    ->values()
                    ->all() ?? [];

                $roomTypeNames = $review->booking?->details
                    ?->map(fn (BookingDetail $detail) => $detail->roomType?->name)
                    ->filter()
                    ->unique()
                    ->values()
                    ->all() ?? [];

                return [
                    'id' => $review->id,
                    'booking_id' => $review->booking_id,
                    'booking_code' => $review->booking?->booking_code,
                    'customer_id' => $review->customer_id,
                    'customer_name' => $review->customer?->full_name,
                    'homestay_id' => $review->homestay_id,
                    'homestay_name' => $review->homestay?->name,
                    'room_codes' => $roomCodes ?: ['Chưa gán phòng'],
                    'room_type_names' => $roomTypeNames,
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at?->toISOString(),
                ];
            })->values()->all(),
        ];
    }

    protected function buildCustomerTimeseries(Carbon $start, Carbon $end, array $newCustomersPerDate): array
    {
        $points = [];
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            $date = $cursor->toDateString();

            $points[] = [
                'date' => $date,
                'value' => (int) ($newCustomersPerDate[$date] ?? 0),
            ];

            $cursor->addDay();
        }

        return $points;
    }

    protected function emptyCustomerTimeseries(Carbon $start, Carbon $end): array
    {
        return $this->buildCustomerTimeseries($start, $end, []);
    }
}
