<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoomTypeRequest;
use App\Http\Resources\RoomTypeResource;
use App\Models\RoomType;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRoomTypeController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = RoomType::with('homestay')->withCount('rooms');

        if ($request->has('homestay_id')) {
            $query->where('homestay_id', $request->homestay_id);
        }

        $roomTypes = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginated($roomTypes, data: RoomTypeResource::collection($roomTypes->getCollection()));
    }

    public function store(StoreRoomTypeRequest $request): JsonResponse
    {
        $roomType = RoomType::create($request->validated());

        return $this->success(new RoomTypeResource($roomType->load('homestay')), 'Tạo loại phòng thành công.', 201);
    }

    public function show(RoomType $roomType): JsonResponse
    {
        $roomType->load('homestay', 'rooms');

        return $this->success(new RoomTypeResource($roomType));
    }

    public function update(StoreRoomTypeRequest $request, RoomType $roomType): JsonResponse
    {
        $roomType->update($request->validated());

        return $this->success(new RoomTypeResource($roomType->fresh('homestay')), 'Cập nhật loại phòng thành công.');
    }

    public function destroy(RoomType $roomType): JsonResponse
    {
        $roomType->delete();

        return $this->success(null, 'Xóa loại phòng thành công.');
    }
}
