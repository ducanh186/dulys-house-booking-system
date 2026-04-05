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
            'transfer_content' => $this->transfer_content,
            'qr_payload' => $this->qr_payload,
            'proof_image_url' => $this->proof_image_url,
            'proof_uploaded_at' => $this->proof_uploaded_at?->toISOString(),
            'verified_by' => $this->verified_by,
            'verified_at' => $this->verified_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'booking' => $this->whenLoaded('booking', fn () => new BookingReferenceResource($this->booking)),
        ];
    }
}
