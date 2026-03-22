<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BlockDatesRequest;
use App\Models\BlockedDate;
use App\Models\RoomType;
use App\Services\AvailabilityService;
use App\Services\PricingService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminAvailabilityController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AvailabilityService $availability,
        protected PricingService $pricing,
    ) {}

    public function calendar(RoomType $roomType, Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        $date = Carbon::createFromFormat('Y-m', $month)->startOfMonth();

        $calendar = $this->availability->getMonthlyCalendar($roomType->id, $date);

        // Add pricing info to each day
        foreach ($calendar as &$day) {
            $day['price'] = $this->pricing->getEffectivePrice($roomType->id, Carbon::parse($day['date']));
        }

        return $this->success($calendar);
    }

    public function blockDates(RoomType $roomType, BlockDatesRequest $request)
    {
        $blocked = BlockedDate::create([
            'room_type_id' => $roomType->id,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'reason' => $request->reason,
        ]);

        return $this->success($blocked, 'Chặn ngày thành công.', 201);
    }

    public function unblock(BlockedDate $blockedDate)
    {
        $blockedDate->delete();

        return $this->success(null, 'Đã bỏ chặn ngày.');
    }
}
