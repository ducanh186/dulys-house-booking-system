<?php

namespace App\Services;

use App\Models\PriceOverride;
use App\Models\RoomType;
use Carbon\Carbon;

class PricingService
{
    /**
     * Calculate total price for a room type over a date range.
     * Checks for date-specific price overrides before falling back to nightly_rate.
     */
    public function calculateTotal(string $roomTypeId, Carbon $checkIn, Carbon $checkOut, int $quantity = 1): array
    {
        $roomType = RoomType::findOrFail($roomTypeId);
        $nights = max(1, (int) $checkIn->diffInDays($checkOut));
        $baseRate = (float) $roomType->nightly_rate;

        $overrides = PriceOverride::where('room_type_id', $roomTypeId)
            ->whereDate('date_from', '<=', $checkOut->toDateString())
            ->whereDate('date_to', '>=', $checkIn->toDateString())
            ->get();

        $totalPerUnit = 0;
        $current = $checkIn->copy();

        for ($i = 0; $i < $nights; $i++) {
            $date = $current->toDateString();
            $nightPrice = $baseRate;

            foreach ($overrides as $override) {
                if ($date >= $override->date_from->toDateString() && $date <= $override->date_to->toDateString()) {
                    $nightPrice = (float) $override->override_price;
                    break;
                }
            }

            $totalPerUnit += $nightPrice;
            $current->addDay();
        }

        return [
            'unit_price' => $baseRate,
            'nights' => $nights,
            'quantity' => $quantity,
            'subtotal' => $totalPerUnit * $quantity,
        ];
    }

    /**
     * Get effective price for a specific date.
     */
    public function getEffectivePrice(string $roomTypeId, Carbon $date): float
    {
        $roomType = RoomType::findOrFail($roomTypeId);
        $dateStr = $date->toDateString();

        $override = PriceOverride::where('room_type_id', $roomTypeId)
            ->whereDate('date_from', '<=', $dateStr)
            ->whereDate('date_to', '>=', $dateStr)
            ->first();

        return $override ? (float) $override->override_price : (float) $roomType->nightly_rate;
    }
}
