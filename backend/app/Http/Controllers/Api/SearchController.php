<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchAvailabilityRequest;
use App\Http\Resources\SearchAvailabilityResource;
use App\Services\AvailabilityService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AvailabilityService $availability,
    ) {}

    public function search(SearchAvailabilityRequest $request): JsonResponse
    {
        $results = $this->availability->searchAvailable(
            $request->homestay_id,
            Carbon::parse($request->check_in),
            Carbon::parse($request->check_out),
            $request->integer('guests', 1),
        );

        return $this->success(SearchAvailabilityResource::collection($results), 'Kết quả tìm kiếm.');
    }
}
