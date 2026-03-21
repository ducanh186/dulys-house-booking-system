<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SearchAvailabilityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'room_type' => new RoomTypeResource($this['room_type']),
            'homestay' => new HomestayResource($this['room_type']->homestay),
            'available_count' => (int) $this['available_count'],
            'nightly_rate' => (float) $this['room_type']->nightly_rate,
            'max_guests' => (int) $this['room_type']->max_guests,
        ];
    }
}
