<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HomestayResource;
use App\Models\Homestay;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class HomestayController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $homestays = Homestay::where('is_active', true)
            ->withCount('roomTypes')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->withMin('roomTypes', 'nightly_rate')
            ->paginate(12);

        return $this->paginated($homestays, data: HomestayResource::collection($homestays->getCollection()));
    }

    public function show(Homestay $homestay): JsonResponse
    {
        $homestay->load([
            'roomTypes' => fn ($q) => $q->where('is_active', true),
            'roomTypes.rooms',
        ]);

        return $this->success(new HomestayResource($homestay));
    }
}
