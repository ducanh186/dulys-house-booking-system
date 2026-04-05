<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InternalAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $staff = $this->resource->relationLoaded('staff') ? $this->staff : null;

        return [
            'id' => $this->id,
            'full_name' => $staff?->full_name ?? $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'role_label' => $this->roleLabel(),
            'role_title' => $staff?->role_title ?? $this->roleLabel(),
            'is_active' => (bool) ($staff?->is_active ?? false),
            'status_label' => ($staff?->is_active ?? false) ? 'Hoạt động' : 'Tạm khóa',
            'created_at' => $this->created_at?->toISOString(),
            'created_date_label' => $this->created_at?->format('d/m/Y'),
            'is_current_user' => $request->user()?->is($this->resource) ?? false,
        ];
    }

    private function roleLabel(): string
    {
        return match ($this->role) {
            'admin' => 'Quản trị',
            'owner' => 'Quản lý',
            default => 'Lễ tân',
        };
    }
}
