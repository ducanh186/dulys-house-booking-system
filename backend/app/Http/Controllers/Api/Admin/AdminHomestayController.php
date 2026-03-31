<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHomestayRequest;
use App\Http\Resources\HomestayResource;
use App\Models\Homestay;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminHomestayController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Homestay::query();

        if ($request->boolean('include_suspended')) {
            $query->withTrashed();
        }

        $homestays = $query->withCount(['roomTypes', 'rooms'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return $this->paginated($homestays, data: HomestayResource::collection($homestays->getCollection()));
    }

    public function store(StoreHomestayRequest $request): JsonResponse
    {
        $homestay = Homestay::create($request->validated());

        return $this->success(new HomestayResource($homestay), 'Tạo cơ sở thành công.', 201);
    }

    public function show(Homestay $homestay): JsonResponse
    {
        $homestay->load('roomTypes.rooms');

        return $this->success(new HomestayResource($homestay));
    }

    public function update(StoreHomestayRequest $request, Homestay $homestay): JsonResponse
    {
        $homestay->update($request->validated());

        return $this->success(new HomestayResource($homestay->fresh()), 'Cập nhật cơ sở thành công.');
    }

    public function destroy(Homestay $homestay): JsonResponse
    {
        $homestay->delete();

        return $this->success(null, 'Đình chỉ cơ sở thành công.');
    }

    public function restore(Homestay $homestay): JsonResponse
    {
        $homestay->restore();

        return $this->success(new HomestayResource($homestay->fresh()), 'Khôi phục cơ sở thành công.');
    }
}
