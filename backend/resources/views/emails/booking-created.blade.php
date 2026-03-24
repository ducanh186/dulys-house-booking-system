Xin chào {{ $recipientName }},

Cảm ơn bạn đã đặt phòng tại Duly's House!

Mã đặt phòng: {{ $booking->booking_code }}
Ngày nhận phòng: {{ \Carbon\Carbon::parse($booking->check_in)->format('d/m/Y') }}
Ngày trả phòng: {{ \Carbon\Carbon::parse($booking->check_out)->format('d/m/Y') }}
Số khách: {{ $booking->guest_count }} người
Tổng tiền: {{ number_format($booking->total_amount, 0, ',', '.') }}₫

Đơn đặt phòng của bạn đang chờ xác nhận. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.

Lưu ý: Đơn chưa xác nhận sẽ tự động huỷ sau 15 phút.

Trân trọng,
Duly's House
