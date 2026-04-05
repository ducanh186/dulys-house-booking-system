<?php

namespace App\Services;

use App\Mail\BookingCancelledMail;
use App\Mail\BookingCheckedInMail;
use App\Mail\BookingCheckedOutMail;
use App\Mail\BookingConfirmedMail;
use App\Mail\BookingCreatedMail;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function notify(User $user, string $type, string $title, string $message, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data ?: null,
        ]);
    }

    public function notifyBookingCreated(Booking $booking): void
    {
        $booking->loadMissing('customer.user', 'details.roomType.homestay');
        $homestayName = $booking->details->first()?->roomType?->homestay?->name ?? 'Homestay';

        // Notify admins/staff (DB only)
        $admins = User::whereIn('role', ['admin', 'owner', 'staff'])->get();
        foreach ($admins as $admin) {
            $this->notify(
                $admin,
                'booking_created',
                'Đặt phòng mới',
                "Đơn {$booking->booking_code} từ {$booking->customer->full_name} tại {$homestayName}.",
                ['booking_id' => $booking->id],
            );
        }

        // Email to customer
        $customerEmail = $booking->customer?->email;
        $customerName = $booking->customer?->full_name ?? 'Quý khách';
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new BookingCreatedMail($booking, $customerName));
        }
    }

    public function notifyBookingConfirmed(Booking $booking): void
    {
        $booking->loadMissing('customer.user');
        $user = $booking->customer?->user;
        $customerName = $booking->customer?->full_name ?? 'Quý khách';

        if ($user) {
            $this->notify(
                $user,
                'booking_confirmed',
                'Đặt phòng đã xác nhận',
                "Đơn {$booking->booking_code} của bạn đã được xác nhận.",
                ['booking_id' => $booking->id],
            );
        }

        $customerEmail = $booking->customer?->email;
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new BookingConfirmedMail($booking, $customerName));
        }
    }

    public function notifyBookingCancelled(Booking $booking): void
    {
        $booking->loadMissing('customer.user');
        $user = $booking->customer?->user;
        $customerName = $booking->customer?->full_name ?? 'Quý khách';

        if ($user) {
            $this->notify(
                $user,
                'booking_cancelled',
                'Đặt phòng đã huỷ',
                "Đơn {$booking->booking_code} đã bị huỷ.",
                ['booking_id' => $booking->id],
            );
        }

        $customerEmail = $booking->customer?->email;
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new BookingCancelledMail($booking, $customerName));
        }
    }

    public function notifyCheckIn(Booking $booking): void
    {
        $booking->loadMissing('customer.user');
        $user = $booking->customer?->user;
        $customerName = $booking->customer?->full_name ?? 'Quý khách';

        if ($user) {
            $this->notify(
                $user,
                'check_in',
                'Đã nhận phòng',
                "Chào mừng bạn! Đơn {$booking->booking_code} đã check-in thành công.",
                ['booking_id' => $booking->id],
            );
        }

        $customerEmail = $booking->customer?->email;
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new BookingCheckedInMail($booking, $customerName));
        }
    }

    public function notifyCheckOut(Booking $booking): void
    {
        $booking->loadMissing('customer.user');
        $user = $booking->customer?->user;
        $customerName = $booking->customer?->full_name ?? 'Quý khách';

        if ($user) {
            $this->notify(
                $user,
                'check_out',
                'Đã trả phòng',
                "Cảm ơn bạn! Đơn {$booking->booking_code} đã check-out. Hẹn gặp lại!",
                ['booking_id' => $booking->id],
            );
        }

        $customerEmail = $booking->customer?->email;
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new BookingCheckedOutMail($booking, $customerName));
        }
    }

    public function notifyProofUploaded(Booking $booking): void
    {
        $booking->loadMissing('customer.user', 'details.roomType.homestay');
        $homestayName = $booking->details->first()?->roomType?->homestay?->name ?? 'Homestay';

        $admins = User::whereIn('role', ['admin', 'owner', 'staff'])->get();
        foreach ($admins as $admin) {
            $this->notify(
                $admin,
                'proof_uploaded',
                'Khách đã gửi minh chứng thanh toán',
                "Đơn {$booking->booking_code} từ {$booking->customer->full_name} tại {$homestayName} đã gửi minh chứng chuyển khoản. Vui lòng xác nhận.",
                ['booking_id' => $booking->id],
            );
        }
    }

    public function notifyPaymentConfirmed(Booking $booking): void
    {
        $booking->loadMissing('customer.user');
        $user = $booking->customer?->user;

        if ($user) {
            $this->notify(
                $user,
                'payment_confirmed',
                'Thanh toán đã được xác nhận',
                "Thanh toán cho đơn {$booking->booking_code} đã được xác nhận. Đơn đặt phòng của bạn đã được xác nhận.",
                ['booking_id' => $booking->id],
            );
        }
    }

    public function notifyBookingExpired(Booking $booking): void
    {
        $booking->loadMissing('customer.user');
        $user = $booking->customer?->user;

        if ($user) {
            $this->notify(
                $user,
                'booking_expired',
                'Đặt phòng đã hết hạn',
                "Đơn {$booking->booking_code} đã hết hạn do không hoàn tất thanh toán trong thời gian quy định.",
                ['booking_id' => $booking->id],
            );
        }
    }
}
