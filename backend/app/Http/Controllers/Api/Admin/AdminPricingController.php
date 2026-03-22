<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePriceOverrideRequest;
use App\Models\PriceOverride;
use App\Models\RoomType;
use App\Services\PricingService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminPricingController extends Controller
{
    use ApiResponse;

    public function __construct(protected PricingService $pricing) {}

    public function index(RoomType $roomType, Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $overrides = PriceOverride::where('room_type_id', $roomType->id)
            ->where('date_from', '<=', $end->toDateString())
            ->where('date_to', '>=', $start->toDateString())
            ->get();

        $basePrice = (float) $roomType->nightly_rate;
        $data = [];
        $current = $start->copy();

        while ($current->lte($end)) {
            $date = $current->toDateString();
            $override = $overrides->first(fn ($o) =>
                $date >= $o->date_from->toDateString() && $date <= $o->date_to->toDateString()
            );

            $data[] = [
                'date' => $date,
                'base_price' => $basePrice,
                'override_price' => $override ? (float) $override->override_price : null,
                'override_id' => $override?->id,
                'effective_price' => $override ? (float) $override->override_price : $basePrice,
                'reason' => $override?->reason,
            ];

            $current->addDay();
        }

        return $this->success($data);
    }

    public function store(RoomType $roomType, StorePriceOverrideRequest $request)
    {
        $override = PriceOverride::create([
            'room_type_id' => $roomType->id,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'override_price' => $request->override_price,
            'reason' => $request->reason,
        ]);

        return $this->success($override, 'Đặt giá riêng thành công.', 201);
    }

    public function destroy(PriceOverride $priceOverride)
    {
        $priceOverride->delete();

        return $this->success(null, 'Đã xóa giá riêng.');
    }
}
