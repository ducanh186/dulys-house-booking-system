<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Homestay;
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
}
