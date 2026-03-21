<?php

namespace App\Services;

use App\Models\RoomType;
use Carbon\Carbon;

class PricingService
{
    /**
     * Calculate total price for a room type over a date range.
     * MVP: nightly_rate * number_of_nights * quantity
     */
    public function calculateTotal(string $roomTypeId, Carbon $checkIn, Carbon $checkOut, int $quantity = 1): array
    {
        $roomType = RoomType::findOrFail($roomTypeId);
        $nights = (int) $checkIn->diffInDays($checkOut);

        if ($nights < 1) {
            $nights = 1;
        }

        $unitPrice = (float) $roomType->nightly_rate;
        $subtotal = $unitPrice * $nights * $quantity;

        return [
            'unit_price' => $unitPrice,
            'nights' => $nights,
            'quantity' => $quantity,
            'subtotal' => $subtotal,
        ];
    }
}
