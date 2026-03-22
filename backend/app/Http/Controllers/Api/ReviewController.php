<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Booking;
use App\Models\Homestay;
use App\Models\Review;
use App\Traits\ApiResponse;

class ReviewController extends Controller
{
    use ApiResponse;

    public function store(StoreReviewRequest $request)
    {
        $booking = Booking::with('customer', 'details.roomType')->findOrFail($request->booking_id);

        // Must be checked_out
        if ($booking->status !== 'checked_out') {
            return $this->error('Chỉ có thể đánh giá sau khi đã trả phòng.', 422);
        }

        // Must be booking owner
        $user = $request->user();
        if (!$user->customer || $booking->customer_id !== $user->customer->id) {
            return $this->error('Bạn không có quyền đánh giá đơn này.', 403);
        }

        // Already reviewed
        if ($booking->review()->exists()) {
            return $this->error('Đơn đặt phòng này đã được đánh giá.', 422);
        }

        $homestayId = $booking->details->first()?->roomType?->homestay_id;
        if (!$homestayId) {
            return $this->error('Không tìm thấy thông tin homestay.', 422);
        }

        $review = Review::create([
            'booking_id' => $booking->id,
            'customer_id' => $booking->customer_id,
            'homestay_id' => $homestayId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return $this->success($review->load('customer'), 'Đánh giá thành công.', 201);
    }

    public function index(Homestay $homestay)
    {
        $reviews = $homestay->reviews()
            ->with('customer')
            ->latest()
            ->paginate(10);

        $data = $reviews->getCollection()->map(fn ($r) => [
            'id' => $r->id,
            'rating' => $r->rating,
            'comment' => $r->comment,
            'customer_name' => $r->customer?->full_name,
            'created_at' => $r->created_at->toDateTimeString(),
        ]);

        return $this->paginated($reviews, 'Success', $data);
    }
}
