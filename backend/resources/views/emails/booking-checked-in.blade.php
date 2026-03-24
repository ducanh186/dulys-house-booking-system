Xin chào {{ $recipientName }},

Chào mừng bạn đến Duly's House!

Đơn {{ $booking->booking_code }} đã check-in thành công.
Ngày trả phòng: {{ \Carbon\Carbon::parse($booking->check_out)->format('d/m/Y') }}

Chúc bạn có kỳ nghỉ vui vẻ! Nếu cần hỗ trợ, hãy liên hệ nhân viên tại quầy lễ tân.

Trân trọng,
Duly's House
