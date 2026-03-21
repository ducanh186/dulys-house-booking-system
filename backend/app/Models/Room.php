<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasUuids;

    protected $fillable = [
        'room_type_id', 'room_code', 'status', 'cleanliness', 'notes', 'main_image',
    ];

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function bookingDetails(): HasMany
    {
        return $this->hasMany(BookingDetail::class);
    }

    public function assignedBookingDetails(): BelongsToMany
    {
        return $this->belongsToMany(BookingDetail::class, 'booking_detail_rooms')
            ->withTimestamps();
    }
}
