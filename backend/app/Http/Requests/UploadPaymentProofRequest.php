<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadPaymentProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proof_image' => ['required', 'image', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'proof_image.required' => 'Vui lòng chọn ảnh minh chứng thanh toán.',
            'proof_image.image' => 'File phải là hình ảnh (jpg, png, gif, webp).',
            'proof_image.max' => 'Ảnh không được vượt quá 5MB.',
        ];
    }
}
