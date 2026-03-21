<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BookingDetail extends Model
{
    use HasUuids;

    protected $fillable = [
        'booking_id', 'room_type_id', 'room_id', 'unit_price', 'quantity', 'nights',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'quantity' => 'integer',
            'nights' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function assignedRooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class, 'booking_detail_rooms')
            ->withTimestamps();
    }

    public function getSubtotalAttribute(): float
    {
        return $this->unit_price * $this->quantity * $this->nights;
    }
}
