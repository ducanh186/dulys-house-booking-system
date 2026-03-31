<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'homestay_id' => $this->homestay_id,
            'name' => $this->name,
            'description' => $this->description,
            'hourly_rate' => $this->hourly_rate !== null ? (float) $this->hourly_rate : null,
            'nightly_rate' => (float) $this->nightly_rate,
            'max_guests' => (int) $this->max_guests,
            'is_active' => (bool) $this->is_active,
            'is_suspended' => $this->trashed(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'rooms_count' => $this->whenCounted('rooms'),
            'homestay' => $this->whenLoaded('homestay', fn () => new HomestayResource($this->homestay)),
            'rooms' => RoomResource::collection($this->whenLoaded('rooms')),
        ];
    }
}
