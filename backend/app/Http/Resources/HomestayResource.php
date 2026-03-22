<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomestayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'address' => $this->address,
            'hotline' => $this->hotline,
            'email' => $this->email,
            'description' => $this->description,
            'thumbnail' => $this->thumbnail,
            'is_active' => (bool) $this->is_active,
            'room_types_count' => $this->whenCounted('roomTypes'),
            'rooms_count' => $this->whenCounted('rooms'),
            'average_rating' => $this->reviews_avg_rating ? round((float) $this->reviews_avg_rating, 1) : null,
            'reviews_count' => $this->reviews_count ?? 0,
            'min_price' => $this->room_types_min_nightly_rate ? (float) $this->room_types_min_nightly_rate : null,
            'room_types' => RoomTypeResource::collection($this->whenLoaded('roomTypes')),
        ];
    }
}
