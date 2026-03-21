<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;

class PaymentService
{
    public function createPayment(Booking $booking, string $method, float $amount): Payment
    {
        return Payment::create([
            'booking_id' => $booking->id,
            'method' => $method,
            'amount' => $amount,
            'status' => 'pending',
        ]);
    }

    public function markPaid(Payment $payment): Payment
    {
        $payment->update([
            'status' => 'success',
            'paid_at' => now(),
        ]);

        return $payment->fresh();
    }

    public function processRefund(Payment $payment): Payment
    {
        $payment->update([
            'status' => 'refunded',
        ]);

        return $payment->fresh();
    }
}
