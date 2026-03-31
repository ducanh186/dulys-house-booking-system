<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_type_id' => $this->room_type_id,
            'room_code' => $this->room_code,
            'status' => $this->status,
            'cleanliness' => $this->cleanliness,
            'notes' => $this->notes,
            'main_image' => $this->main_image,
            'is_suspended' => $this->trashed(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'room_type' => $this->whenLoaded('roomType', fn () => new RoomTypeResource($this->roomType)),
        ];
    }
}
