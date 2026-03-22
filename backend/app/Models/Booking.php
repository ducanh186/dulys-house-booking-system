<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasUuids;

    public const PENDING_HOLD_MINUTES = 15;

    protected $appends = ['check_in_date', 'check_out_date'];

    protected $fillable = [
        'booking_code', 'customer_id', 'staff_id', 'check_in', 'check_out',
        'guest_count', 'status', 'expires_at', 'total_amount', 'deposit', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'datetime',
            'check_out' => 'datetime',
            'expires_at' => 'datetime',
            'total_amount' => 'decimal:2',
            'deposit' => 'decimal:2',
            'guest_count' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(BookingDetail::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function review(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function scopeOverlapping(Builder $query, Carbon $checkIn, Carbon $checkOut): Builder
    {
        return $query
            ->where('check_in', '<', $checkOut)
            ->where('check_out', '>', $checkIn);
    }

    public function scopeInventoryHeld(Builder $query): Builder
    {
        return $query->where(function (Builder $builder) {
            $builder
                ->whereIn('status', ['confirmed', 'checked_in'])
                ->orWhere(function (Builder $pending) {
                    $pending
                        ->where('status', 'pending')
                        ->where(function (Builder $expiry) {
                            $expiry
                                ->whereNull('expires_at')
                                ->orWhere('expires_at', '>', now());
                        });
                });
        });
    }

    public function scopeExpiredPending(Builder $query): Builder
    {
        return $query
            ->where('status', 'pending')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now());
    }

    public function getNightsAttribute(): int
    {
        return (int) $this->check_in->diffInDays($this->check_out);
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    public function isPendingExpired(): bool
    {
        return $this->status === 'pending'
            && $this->expires_at !== null
            && $this->expires_at->isPast();
    }

    public function getCheckInDateAttribute(): ?string
    {
        return $this->check_in?->toDateString();
    }

    public function getCheckOutDateAttribute(): ?string
    {
        return $this->check_out?->toDateString();
    }
}
