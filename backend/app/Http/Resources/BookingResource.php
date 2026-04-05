<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $homestay = $this->details->first()?->roomType?->homestay;
        $review = $this->relationLoaded('review') ? $this->review : null;
        $hasReview = $this->relationLoaded('review')
            ? $review !== null
            : $this->review()->exists();

        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'status' => $this->status,
            'check_in' => $this->check_in?->toISOString(),
            'check_out' => $this->check_out?->toISOString(),
            'check_in_date' => $this->check_in_date,
            'check_out_date' => $this->check_out_date,
            'expires_at' => $this->expires_at?->toISOString(),
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'cancel_reason' => $this->cancel_reason,
            'guest_count' => (int) $this->guest_count,
            'total_amount' => (float) $this->total_amount,
            'deposit' => $this->deposit !== null ? (float) $this->deposit : null,
            'notes' => $this->notes,
            'nights' => $this->nights,
            'homestay' => $homestay ? new HomestayResource($homestay) : null,
            'customer' => $this->whenLoaded('customer', fn () => new CustomerResource($this->customer)),
            'details' => BookingDetailResource::collection($this->whenLoaded('details')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'has_review' => $hasReview,
            'review' => $review ? [
                'id' => $review->id,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at?->toISOString(),
            ] : null,
        ];
    }
}
