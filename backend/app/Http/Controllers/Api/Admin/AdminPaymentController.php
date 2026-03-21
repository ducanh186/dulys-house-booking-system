<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\BookingExpiryService;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BookingExpiryService $bookingExpiry,
        protected PaymentService $paymentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->bookingExpiry->expirePendingBookings();

        $query = Payment::with('booking.customer', 'booking.details.roomType.homestay');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginated($payments, data: PaymentResource::collection($payments->getCollection()));
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $booking = Booking::findOrFail($request->booking_id);

        $payment = $this->paymentService->createPayment(
            $booking,
            $request->method,
            $request->amount,
        );

        // Auto-mark as paid (mock payment)
        $this->paymentService->markPaid($payment);

        return $this->success(
            new PaymentResource($payment->fresh('booking.customer', 'booking.details.roomType.homestay')),
            'Ghi nhận thanh toán thành công.',
            201
        );
    }
}
