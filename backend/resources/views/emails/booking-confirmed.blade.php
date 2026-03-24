Xin chào {{ $recipientName }},

Đặt phòng của bạn đã được xác nhận!

Mã đặt phòng: {{ $booking->booking_code }}
Ngày nhận phòng: {{ \Carbon\Carbon::parse($booking->check_in)->format('d/m/Y') }}
Ngày trả phòng: {{ \Carbon\Carbon::parse($booking->check_out)->format('d/m/Y') }}
Tổng tiền: {{ number_format($booking->total_amount, 0, ',', '.') }}₫

Vui lòng đến đúng giờ vào ngày nhận phòng. Nếu cần thay đổi, hãy liên hệ chúng tôi trước ngày check-in.

Trân trọng,
Duly's House
