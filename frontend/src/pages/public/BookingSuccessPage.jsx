import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Calendar, BedDouble, Hash, Home, Users, CreditCard, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getBooking } from '../../api/bookings';
import { Card, CardContent } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PriceDisplay from '../../components/common/PriceDisplay';
import StatusBadge from '../../components/common/StatusBadge';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import { optimizeImageUrl } from '../../lib/utils';

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const state = location.state;
  const stateBooking = state?.booking || null;
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState(stateBooking);
  const [loading, setLoading] = useState(!stateBooking && !!bookingId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (stateBooking) {
      return;
    }

    if (!bookingId) {
      navigate('/my-profile/bookings', { replace: true });
      return;
    }

    let active = true;
    getBooking(bookingId)
      .then((res) => {
        if (active) setBooking(res.data || null);
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Không thể tải thông tin đặt phòng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [stateBooking, bookingId, navigate]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="space-y-4 p-6 text-center">
            <p className="font-semibold text-on-surface">{error || 'Không tìm thấy thông tin đặt phòng.'}</p>
            <Link
              to="/my-profile/bookings"
              className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2 text-sm font-semibold hover:bg-accent"
            >
              Về lịch sử đặt phòng
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const homestayName = state?.homestayName || booking.homestay?.name || booking.details?.[0]?.room_type?.homestay?.name || 'Duly’s House';
  const roomTypeName = state?.roomTypeName || booking.details?.[0]?.room_type?.name || 'Loại phòng';
  const roomImage = state?.roomImage || booking.homestay?.thumbnail || '';
  const paymentMethod = state?.paymentMethod || booking.payments?.[0]?.method || 'transfer';
  const detailPath = `/my-profile/bookings/${booking.id}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.22),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_36%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.92fr] gap-6 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-teal-500" strokeWidth={1.5} />
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  <Sparkles className="h-4 w-4" />
                  Đặt phòng thành công
                </div>
              </div>
              <h1 className="font-headline text-3xl sm:text-5xl font-extrabold text-on-surface leading-tight">
                Cảm ơn bạn, đặt phòng của bạn đã được ghi nhận.
              </h1>
              <p className="max-w-2xl text-on-surface-variant text-sm sm:text-base leading-6">
                Chúng tôi đã nhận được yêu cầu và đang xử lý xác nhận. Hãy kiểm tra lại chi tiết bên dưới để theo dõi trạng thái và phương thức thanh toán.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={detailPath}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-body h-10 px-6 py-2 sunlight-gradient text-white hover:opacity-90"
                >
                  Xem đơn đặt phòng
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-body h-10 px-6 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>

            <Card className="overflow-hidden border-border shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="h-44 overflow-hidden">
                {roomImage ? (
                  <img
                    src={optimizeImageUrl(roomImage, 720)}
                    alt={roomTypeName || homestayName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 460px, 100vw"
                  />
                ) : (
                  <ImagePlaceholder name={roomTypeName || homestayName} className="h-full w-full" size="lg" />
                )}
              </div>
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">Mã đặt phòng</p>
                    <p className="font-headline text-2xl font-extrabold text-on-surface">{booking.booking_code}</p>
                  </div>
                  <StatusBadge status={booking.status || 'pending'} />
                </div>

                <div className="rounded-[28px] border border-border bg-surface-container-low p-4 space-y-3">
                  <InfoRow label="Homestay" value={homestayName || booking.homestay?.name} icon={Home} />
                  <InfoRow label="Loại phòng" value={roomTypeName || booking.details?.[0]?.room_type?.name} icon={BedDouble} />
                  <InfoRow label="Số khách" value={`${booking.guest_count || 0} khách`} icon={Users} />
                  <InfoRow label="Thanh toán" value={formatPaymentMethod(paymentMethod)} icon={CreditCard} />
                </div>

                <div className="rounded-[28px] border border-border bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                    <Calendar className="h-4 w-4 text-primary" />
                    Thời gian lưu trú
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    <p>Nhận phòng: <span className="font-semibold text-on-surface">{formatDate(booking.check_in_date)}</span></p>
                    <p>Trả phòng: <span className="font-semibold text-on-surface">{formatDate(booking.check_out_date)}</span></p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-dashed border-primary/25 bg-primary/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-on-surface">Tổng tiền</span>
                  </div>
                  <span className="font-headline text-2xl font-bold text-primary">
                    <PriceDisplay amount={booking.total_amount} />
                  </span>
                </div>

                <div className="flex items-start gap-3 rounded-[24px] border border-tertiary/20 bg-tertiary-container/30 p-4 text-sm">
                  <ShieldCheck className="h-4 w-4 text-tertiary mt-0.5" />
                  <p className="text-on-surface-variant leading-6">
                    Vui lòng kiểm tra email và lịch đặt phòng của bạn. Nếu cần hỗ trợ, hãy liên hệ homestay hoặc quay lại danh sách đặt phòng.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  const Icon = icon;

  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white border border-border">
        <Icon className="h-4 w-4 text-on-surface-variant" />
      </span>
      <div className="flex-1">
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="font-semibold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPaymentMethod(method) {
  if (!method) return 'Chưa chọn';
  const map = {
    transfer: 'Chuyển khoản',
    cash: 'Tiền mặt',
    card: 'Thẻ thanh toán',
  };
  return map[method] || method;
}
