<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\RoomType;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ReviewSeeder extends Seeder
{
    protected const SAMPLE_NOTE = 'Seed dữ liệu mẫu để test báo cáo đánh giá.';

    protected const TARGET_SAMPLE_REVIEWS = 50;

    public function run(): void
    {
        $reviewPlan = collect($this->buildReviewPlan());

        $bookings = Booking::query()
            ->with('details.roomType.homestay', 'details.room')
            ->where('status', 'checked_out')
            ->doesntHave('review')
            ->get();

        $sampleBookings = $this->ensureSampleCheckedOutBookings();

        foreach ($sampleBookings as $index => $booking) {
            $seed = $reviewPlan[$index];
            $homestayId = $booking->details->first()?->roomType?->homestay_id;

            if (!$homestayId) {
                continue;
            }

            $review = Review::updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'customer_id' => $booking->customer_id,
                    'homestay_id' => $homestayId,
                    'rating' => $seed['rating'],
                    'comment' => $seed['comment'],
                ],
            );

            $review->forceFill([
                'created_at' => $seed['created_at'],
                'updated_at' => $seed['created_at']->copy()->addMinutes(10),
            ])->saveQuietly();
        }

        foreach ($bookings as $index => $booking) {
            $seed = $reviewPlan[($index + $sampleBookings->count()) % $reviewPlan->count()];
            $homestayId = $booking->details->first()?->roomType?->homestay_id;

            if (!$homestayId) {
                continue;
            }

            $review = Review::updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'customer_id' => $booking->customer_id,
                    'homestay_id' => $homestayId,
                    'rating' => $seed['rating'],
                    'comment' => $seed['comment'],
                ],
            );

            $review->forceFill([
                'created_at' => $seed['created_at'],
                'updated_at' => $seed['created_at']->copy()->addMinutes(10),
            ])->saveQuietly();
        }
    }

    protected function ensureSampleCheckedOutBookings(): Collection
    {
        $customers = Customer::query()->get();
        $roomTypes = RoomType::query()
            ->with(['homestay', 'rooms'])
            ->where('is_active', true)
            ->get()
            ->filter(fn (RoomType $roomType) => $roomType->homestay && $roomType->rooms->isNotEmpty())
            ->values();

        if ($customers->isEmpty() || $roomTypes->isEmpty()) {
            return collect();
        }

        $sampleBookings = Booking::query()
            ->with(['details.roomType.homestay', 'details.room'])
            ->where('notes', self::SAMPLE_NOTE)
            ->orderBy('created_at')
            ->get();

        $missing = self::TARGET_SAMPLE_REVIEWS - $sampleBookings->count();

        if ($missing <= 0) {
            return $sampleBookings->take(self::TARGET_SAMPLE_REVIEWS)->values();
        }

        $newBookings = collect(range($sampleBookings->count(), self::TARGET_SAMPLE_REVIEWS - 1))->map(function (int $index) use ($customers, $roomTypes) {
            $seed = $this->buildReviewSeed($index);
            $roomType = $roomTypes[$index % $roomTypes->count()];
            $customer = $customers[$index % $customers->count()];
            $room = $roomType->rooms->first();
            $checkIn = $seed['check_in'];
            $checkOut = $seed['check_out'];
            $createdAt = $seed['booking_created_at'];
            $unitPrice = (float) $roomType->nightly_rate;
            $nights = max(1, $checkIn->diffInDays($checkOut));
            $totalAmount = $unitPrice * $nights;

            $booking = Booking::create([
                'booking_code' => 'BK' . strtoupper(Str::random(6)),
                'customer_id' => $customer->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guest_count' => max(1, min(2, (int) $roomType->max_guests)),
                'status' => 'checked_out',
                'total_amount' => $totalAmount,
                'deposit' => $totalAmount * 0.5,
                'notes' => self::SAMPLE_NOTE,
            ]);

            $booking->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $checkOut->copy()->addHours(1),
            ])->saveQuietly();

            $detail = BookingDetail::create([
                'booking_id' => $booking->id,
                'room_type_id' => $roomType->id,
                'room_id' => $room?->id,
                'unit_price' => $unitPrice,
                'quantity' => 1,
                'nights' => $nights,
            ]);

            $detail->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ])->saveQuietly();

            $payment = Payment::create([
                'booking_id' => $booking->id,
                'method' => 'card',
                'amount' => $totalAmount,
                'paid_at' => $createdAt->copy()->addHours(2),
                'status' => 'success',
            ]);

            $payment->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt->copy()->addHours(2),
            ])->saveQuietly();

            return $booking->fresh(['details.roomType.homestay', 'details.room']);
        })->filter()->values();

        return $sampleBookings
            ->concat($newBookings)
            ->sortBy('created_at')
            ->take(self::TARGET_SAMPLE_REVIEWS)
            ->values();
    }

    protected function buildReviewPlan(): array
    {
        return collect(range(0, self::TARGET_SAMPLE_REVIEWS - 1))
            ->map(fn (int $index) => $this->buildReviewSeed($index))
            ->all();
    }

    protected function buildReviewSeed(int $index): array
    {
        $ratings = [5, 4, 5, 3, 4, 5, 2, 4, 5, 3, 4, 5, 1, 3, 4, 5, 2, 4, 5, 3, 4, 5, 1, 2, 4, 5, 3, 4, 5, 2, 3, 4, 5, 1, 4, 5, 2, 3, 4, 5, 5, 4, 3, 5, 2, 4, 5, 1, 4, 5];
        $rating = $ratings[$index % count($ratings)];
        $reviewWindowStart = Carbon::now()->startOfMonth()->startOfDay();
        $reviewWindowEnd = Carbon::now()->endOfDay();
        $totalWindowMinutes = max(1, $reviewWindowStart->diffInMinutes($reviewWindowEnd));
        $reviewCreatedAt = $reviewWindowStart
            ->copy()
            ->addMinutes((int) floor(($index * $totalWindowMinutes) / max(1, self::TARGET_SAMPLE_REVIEWS - 1)));
        $checkOut = $reviewCreatedAt->copy()->subDays(1 + ($index % 3))->setTime(11, ($index * 11) % 60);
        $checkIn = $checkOut->copy()->subDays(1 + ($index % 2))->setHour(14)->setMinute(($index * 7) % 60);
        $bookingCreatedAt = $checkIn->copy()->subDays(2)->setHour(9)->setMinute(($index * 13) % 60);

        return [
            'rating' => $rating,
            'comment' => $this->commentForRating($rating, $index),
            'created_at' => $reviewCreatedAt,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'booking_created_at' => $bookingCreatedAt,
        ];
    }

    protected function commentForRating(int $rating, int $index): string
    {
        $comments = [
            1 => [
                'Phòng hơi cũ và cách âm chưa tốt, trải nghiệm chưa như mong đợi.',
                'Nhận phòng chậm, tiện nghi thiếu ổn định nên tôi chưa hài lòng.',
                'Vệ sinh chưa kỹ và xử lý yêu cầu còn chậm.',
            ],
            2 => [
                'Vị trí thuận tiện nhưng phòng chưa sạch như kỳ vọng.',
                'Không gian ổn nhưng dịch vụ hỗ trợ chưa đồng đều.',
                'Một số tiện ích hoạt động chưa tốt, cần cải thiện thêm.',
            ],
            3 => [
                'Trải nghiệm ở mức ổn, phù hợp cho chuyến đi ngắn ngày.',
                'Phòng đúng mô tả, tuy nhiên vẫn còn vài điểm cần cải thiện.',
                'Nhân viên hỗ trợ nhiệt tình nhưng tiện nghi chưa thật sự nổi bật.',
            ],
            4 => [
                'Không gian đẹp, phòng gọn gàng và phục vụ khá chu đáo.',
                'Check-in nhanh, vị trí thuận tiện, tổng thể rất ổn.',
                'Gia đình tôi hài lòng, chỉ thiếu một chút ở phần tiện ích phụ trợ.',
            ],
            5 => [
                'Phòng sạch sẽ, nhân viên hỗ trợ nhanh và rất nhiệt tình.',
                'Không gian đẹp, yên tĩnh, rất hợp cho kỳ nghỉ ngắn ngày.',
                'Check-in nhanh, phòng đúng như hình và tiện nghi đầy đủ.',
                'Vị trí thuận tiện, trải nghiệm lưu trú rất dễ chịu.',
                'Homestay ấm cúng, dịch vụ tốt và sẽ quay lại lần sau.',
                'Gia đình tôi rất hài lòng, phòng rộng và sạch sẽ.',
            ],
        ];

        $pool = $comments[$rating] ?? $comments[5];

        return $pool[$index % count($pool)];
    }
}
