<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_type_id' => 'required|uuid|exists:room_types,id',
            'room_code' => 'required|string|max:50',
            'status' => 'nullable|in:available,locked,booked,occupied,maintenance',
            'cleanliness' => 'nullable|in:clean,dirty,cleaning',
            'notes' => 'nullable|string',
            'main_image' => 'nullable|string|max:500',
        ];
    }
}
