<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        return $this->success(new ProfileResource($request->user()->load('customer')));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        $customer = $user->customer()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
            ]
        );

        $customer->update([
            'full_name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
        ]);

        return $this->success(new ProfileResource($user->fresh('customer')), 'Cập nhật thành công.');
    }
}
