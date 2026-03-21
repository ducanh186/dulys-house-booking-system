<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected DashboardService $dashboard,
    ) {}

    public function summary(): JsonResponse
    {
        return $this->success($this->dashboard->getSummary());
    }

    public function revenue(Request $request): JsonResponse
    {
        $from = Carbon::parse($request->get('from', now()->subMonth()->toDateString()));
        $to = Carbon::parse($request->get('to', now()->toDateString()));

        return $this->success($this->dashboard->getRevenueByPeriod($from, $to));
    }
}
