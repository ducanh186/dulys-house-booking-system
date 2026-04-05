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

    public function uploadProof(Payment $payment, string $proofImageUrl): Payment
    {
        $payment->update([
            'proof_image_url' => $proofImageUrl,
            'proof_uploaded_at' => now(),
            'status' => 'proof_uploaded',
        ]);

        $payment->booking->update([
            'status' => 'payment_review',
        ]);

        return $payment->fresh();
    }

    public function confirmPayment(Payment $payment, string $verifiedByUserId): Payment
    {
        $payment->update([
            'status' => 'success',
            'paid_at' => now(),
            'verified_by' => $verifiedByUserId,
            'verified_at' => now(),
        ]);

        $payment->booking->update([
            'status' => 'confirmed',
            'expires_at' => null,
            'confirmed_at' => now(),
        ]);

        return $payment->fresh();
    }

    public function rejectPayment(Payment $payment, ?string $reason = null): Payment
    {
        $payment->update([
            'status' => 'failed',
        ]);

        $payment->booking->update([
            'status' => 'cancelled',
            'expires_at' => null,
            'cancelled_at' => now(),
            'cancel_reason' => $reason ?? 'Thanh toán bị từ chối.',
        ]);

        return $payment->fresh();
    }

    public function markPaymentSubmitted(Payment $payment): Payment
    {
        if ($payment->status === 'pending') {
            $payment->update([
                'status' => 'proof_uploaded',
            ]);

            $payment->booking->update([
                'status' => 'payment_review',
            ]);
        }

        return $payment->fresh();
    }
}
