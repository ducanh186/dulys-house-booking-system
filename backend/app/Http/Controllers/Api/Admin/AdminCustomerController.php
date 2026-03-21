<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\BookingExpiryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BookingExpiryService $bookingExpiry,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->bookingExpiry->expirePendingBookings();

        $query = Customer::withCount('bookings');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginated($customers, data: CustomerResource::collection($customers->getCollection()));
    }

    public function show(Customer $customer): JsonResponse
    {
        $this->bookingExpiry->expirePendingBookings();

        $customer->loadCount('bookings');
        $customer->load([
            'bookings' => fn ($q) => $q->latest()->limit(10),
            'bookings.customer',
            'bookings.details.roomType.homestay',
        ]);

        return $this->success(new CustomerResource($customer));
    }
}
