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
            'room_types' => RoomTypeResource::collection($this->whenLoaded('roomTypes')),
        ];
    }
}
