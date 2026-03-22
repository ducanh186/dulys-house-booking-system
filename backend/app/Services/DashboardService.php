<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Homestay;
use App\Models\Payment;
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

        return $bookings
            ->groupBy(fn (Booking $booking) => $booking->created_at->format('Y-m'))
            ->map(fn ($group, $month) => [
                'month' => $month,
                'revenue' => (float) $group->sum('total_amount'),
                'count' => $group->count(),
            ])
            ->sortBy('month')
            ->values()
            ->all();
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
