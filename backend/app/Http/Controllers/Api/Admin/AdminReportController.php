<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    use ApiResponse;

    public function __construct(protected DashboardService $dashboard) {}

    public function occupancy(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'homestay_id' => 'nullable|uuid|exists:homestays,id',
        ]);

        $data = $this->dashboard->getOccupancyReport(
            $request->query('homestay_id'),
            Carbon::parse($request->query('from')),
            Carbon::parse($request->query('to')),
        );

        return $this->success($data);
    }

    public function cancellations(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $data = $this->dashboard->getCancellationReport(
            Carbon::parse($request->query('from')),
            Carbon::parse($request->query('to')),
        );

        return $this->success($data);
    }

    public function revenueByHomestay(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $data = $this->dashboard->getRevenueByHomestay(
            Carbon::parse($request->query('from')),
            Carbon::parse($request->query('to')),
        );

        return $this->success($data);
    }

    public function occupancyDetail(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'homestay_id' => 'nullable|uuid|exists:homestays,id',
        ]);

        $data = $this->dashboard->getOccupancyDetailReport(
            $request->query('homestay_id'),
            Carbon::parse($request->query('from')),
            Carbon::parse($request->query('to')),
        );

        return $this->success($data);
    }

    public function customers(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $data = $this->dashboard->getCustomerReport(
            Carbon::parse($request->query('from')),
            Carbon::parse($request->query('to')),
        );

        return $this->success($data);
    }

    public function reviews(Request $request)
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'homestay_id' => 'nullable|uuid|exists:homestays,id',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'room_id' => 'nullable|uuid|exists:rooms,id',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $data = $this->dashboard->getReviewReport(
            Carbon::parse($request->query('from')),
            Carbon::parse($request->query('to')),
            $validated,
        );

        return $this->success($data);
    }
}
