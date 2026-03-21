<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingReferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $homestay = $this->details->first()?->roomType?->homestay;

        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'status' => $this->status,
            'check_in' => $this->check_in?->toISOString(),
            'check_out' => $this->check_out?->toISOString(),
            'check_in_date' => $this->check_in_date,
            'check_out_date' => $this->check_out_date,
            'guest_count' => (int) $this->guest_count,
            'total_amount' => (float) $this->total_amount,
            'homestay' => $homestay ? new HomestayResource($homestay) : null,
            'customer' => $this->whenLoaded('customer', fn () => new CustomerResource($this->customer)),
        ];
    }
}
