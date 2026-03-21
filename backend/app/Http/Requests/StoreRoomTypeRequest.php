<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'homestay_id' => 'required|uuid|exists:homestays,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'hourly_rate' => 'nullable|numeric|min:0',
            'nightly_rate' => 'required|numeric|min:0',
            'max_guests' => 'required|integer|min:1|max:20',
            'is_active' => 'nullable|boolean',
        ];
    }
}
