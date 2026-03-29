<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Homestay extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'address', 'hotline', 'email', 'description', 'thumbnail', 'is_active',
    ];

    protected static function booted(): void
    {
        static::creating(function (Homestay $homestay) {
            if (empty($homestay->slug)) {
                $homestay->slug = static::generateUniqueSlug($homestay->name);
            }
        });

        static::updating(function (Homestay $homestay) {
            if ($homestay->isDirty('name') && !$homestay->isDirty('slug')) {
                $homestay->slug = static::generateUniqueSlug($homestay->name, $homestay->id);
            }
        });
    }

    protected static function generateUniqueSlug(string $name, ?string $excludeId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;
        $query = static::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        while ($query->exists()) {
            $slug = $original . '-' . $i++;
            $query = static::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }
        return $slug;
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class);
    }

    public function rooms(): HasManyThrough
    {
        return $this->hasManyThrough(Room::class, RoomType::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getAverageRatingAttribute(): ?float
    {
        $avg = $this->reviews()->avg('rating');
        return $avg ? round($avg, 1) : null;
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->reviews()->count();
    }
}
