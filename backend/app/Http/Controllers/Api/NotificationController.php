<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return $this->paginated($notifications);
    }

    public function markRead(Notification $notification, Request $request)
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->error('Không có quyền truy cập.', 403);
        }

        $notification->update(['read_at' => now()]);

        return $this->success($notification, 'Đã đánh dấu đã đọc.');
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->success(null, 'Đã đánh dấu tất cả đã đọc.');
    }

    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return $this->success(['count' => $count]);
    }
}
