<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $comments = [
            'Phòng sạch sẽ, nhân viên hỗ trợ nhanh và rất nhiệt tình.',
            'Không gian đẹp, yên tĩnh, rất hợp cho kỳ nghỉ ngắn ngày.',
            'Check-in nhanh, phòng đúng như hình và tiện nghi đầy đủ.',
            'Vị trí thuận tiện, trải nghiệm lưu trú rất dễ chịu.',
            'Homestay ấm cúng, dịch vụ tốt và sẽ quay lại lần sau.',
            'Gia đình tôi rất hài lòng, phòng rộng và sạch sẽ.',
        ];

        $bookings = Booking::query()
            ->with('details.roomType')
            ->where('status', 'checked_out')
            ->doesntHave('review')
            ->get();

        foreach ($bookings as $index => $booking) {
            $homestayId = $booking->details->first()?->roomType?->homestay_id;

            if (!$homestayId) {
                continue;
            }

            Review::updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'customer_id' => $booking->customer_id,
                    'homestay_id' => $homestayId,
                    'rating' => 5,
                    'comment' => $comments[$index % count($comments)],
                ],
            );
        }
    }
}
