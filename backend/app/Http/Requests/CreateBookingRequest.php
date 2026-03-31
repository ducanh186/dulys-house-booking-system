<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guest_count' => 'required|integer|min:1|max:4',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'nullable|in:cash,transfer,card',

            // Customer info (for guests without account or walk-in)
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email',

            // Room selections
            'rooms' => 'required|array|min:1',
            'rooms.*.room_type_id' => 'required|uuid|exists:room_types,id',
            'rooms.*.quantity' => 'required|integer|min:1|max:10',
        ];
    }
}
