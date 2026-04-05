<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Services\RoomStatusService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRoomController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected RoomStatusService $roomStatus,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Room::query();

        if ($request->boolean('include_suspended')) {
            $query->withTrashed();
        }

        $query->with('roomType.homestay');

        if ($request->filled('room_type_id')) {
            $query->where('room_type_id', $request->query('room_type_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $rooms = $query->orderBy('room_code')->paginate(20);

        return $this->paginated($rooms, data: RoomResource::collection($rooms->getCollection()));
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $room = Room::create($request->validated());

        return $this->success(new RoomResource($room->load('roomType.homestay')), 'Tạo phòng thành công.', 201);
    }

    public function show(Room $room): JsonResponse
    {
        $room->load('roomType.homestay');

        return $this->success(new RoomResource($room));
    }

    public function update(StoreRoomRequest $request, Room $room): JsonResponse
    {
        $room->update($request->validated());

        return $this->success(new RoomResource($room->fresh('roomType.homestay')), 'Cập nhật phòng thành công.');
    }

    public function destroy(Room $room): JsonResponse
    {
        $room->delete();

        return $this->success(null, 'Đình chỉ phòng thành công.');
    }

    public function restore(Room $room): JsonResponse
    {
        $room->restore();

        return $this->success(new RoomResource($room->fresh('roomType.homestay')), 'Khôi phục phòng thành công.');
    }

    public function updateStatus(Request $request, Room $room): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|in:available,locked,booked,occupied,maintenance',
            'cleanliness' => 'sometimes|in:clean,dirty,cleaning',
        ]);

        if ($request->has('status')) {
            $this->roomStatus->updateStatus($room, $request->status);
        }

        if ($request->has('cleanliness')) {
            $this->roomStatus->updateCleanliness($room, $request->cleanliness);
        }

        return $this->success(new RoomResource($room->fresh('roomType.homestay')), 'Cập nhật trạng thái phòng thành công.');
    }
}
