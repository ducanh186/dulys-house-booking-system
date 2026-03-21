<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'method' => $this->method,
            'status' => $this->status,
            'amount' => (float) $this->amount,
            'paid_at' => $this->paid_at?->toISOString(),
            'booking' => $this->whenLoaded('booking', fn () => new BookingReferenceResource($this->booking)),
        ];
    }
}
