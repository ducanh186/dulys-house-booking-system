<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_type_id' => $this->room_type_id,
            'room_id' => $this->room_id,
            'unit_price' => (float) $this->unit_price,
            'quantity' => (int) $this->quantity,
            'nights' => (int) $this->nights,
            'subtotal' => (float) $this->subtotal,
            'room_type' => $this->whenLoaded('roomType', fn () => new RoomTypeResource($this->roomType)),
            'room' => $this->whenLoaded('room', fn () => $this->room ? new RoomResource($this->room) : null),
            'assigned_rooms' => RoomResource::collection($this->whenLoaded('assignedRooms')),
        ];
    }
}
