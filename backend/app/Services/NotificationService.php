<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;

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
        $booking->loadMissing('customer', 'details.roomType.homestay');
        $homestayName = $booking->details->first()?->roomType?->homestay?->name ?? 'Homestay';

        // Notify admins/staff
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
    }

    public function notifyBookingConfirmed(Booking $booking): void
    {
        $user = $booking->customer?->user;
        if (!$user) return;

        $this->notify(
            $user,
            'booking_confirmed',
            'Đặt phòng đã xác nhận',
            "Đơn {$booking->booking_code} của bạn đã được xác nhận.",
            ['booking_id' => $booking->id],
        );
    }

    public function notifyBookingCancelled(Booking $booking): void
    {
        $user = $booking->customer?->user;
        if (!$user) return;

        $this->notify(
            $user,
            'booking_cancelled',
            'Đặt phòng đã huỷ',
            "Đơn {$booking->booking_code} đã bị huỷ.",
            ['booking_id' => $booking->id],
        );
    }

    public function notifyCheckIn(Booking $booking): void
    {
        $user = $booking->customer?->user;
        if (!$user) return;

        $this->notify(
            $user,
            'check_in',
            'Đã nhận phòng',
            "Chào mừng bạn! Đơn {$booking->booking_code} đã check-in thành công.",
            ['booking_id' => $booking->id],
        );
    }

    public function notifyCheckOut(Booking $booking): void
    {
        $user = $booking->customer?->user;
        if (!$user) return;

        $this->notify(
            $user,
            'check_out',
            'Đã trả phòng',
            "Cảm ơn bạn! Đơn {$booking->booking_code} đã check-out. Hẹn gặp lại!",
            ['booking_id' => $booking->id],
        );
    }
}
