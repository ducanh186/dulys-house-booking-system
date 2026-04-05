<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\BookingExpiryService;
use App\Services\NotificationService;
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
        protected NotificationService $notifications,
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

    public function confirm(Request $request, Payment $payment): JsonResponse
    {
        if (!in_array($payment->status, ['pending', 'proof_uploaded'])) {
            return $this->error('Thanh toán không ở trạng thái có thể xác nhận.', 422);
        }

        $this->paymentService->confirmPayment($payment, $request->user()->id);

        $booking = $payment->booking->fresh('details.roomType.homestay', 'payments', 'customer');
        try { $this->notifications->notifyPaymentConfirmed($booking); } catch (\Throwable) {}

        return $this->success(
            new PaymentResource($payment->fresh('booking.customer', 'booking.details.roomType.homestay')),
            'Đã xác nhận thanh toán.'
        );
    }

    public function reject(Request $request, Payment $payment): JsonResponse
    {
        if (!in_array($payment->status, ['pending', 'proof_uploaded'])) {
            return $this->error('Thanh toán không ở trạng thái có thể từ chối.', 422);
        }

        $reason = $request->input('reason');
        $this->paymentService->rejectPayment($payment, $reason);

        $booking = $payment->booking->fresh('details.roomType.homestay', 'payments', 'customer');
        try { $this->notifications->notifyBookingCancelled($booking); } catch (\Throwable) {}

        return $this->success(
            new PaymentResource($payment->fresh('booking.customer', 'booking.details.roomType.homestay')),
            'Đã từ chối thanh toán.'
        );
    }
}
