import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CreditCard, Home, MessageSquareText, Users } from 'lucide-react';
import { getBooking } from '../../api/bookings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PriceDisplay from '../../components/common/PriceDisplay';
import StatusBadge from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function paymentLabel(status) {
  const labels = {
    pending: 'Chờ thanh toán',
    proof_uploaded: 'Chờ đối soát',
    success: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
    refunded: 'Đã hoàn tiền',
    expired: 'Đã hết hạn',
  };

  return labels[status] || 'Chưa có thanh toán';
}

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getBooking(bookingId)
      .then((res) => {
        if (active) setBooking(res.data || null);
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Không thể tải chi tiết đơn đặt phòng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingId]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="space-y-4 p-6 text-center">
            <p className="font-semibold text-on-surface">{error || 'Không tìm thấy đơn đặt phòng.'}</p>
            <Button variant="outline" onClick={() => navigate('/my-profile/bookings')}>
              Về lịch sử đặt phòng
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const homestayName = booking.homestay?.name || booking.details?.[0]?.room_type?.homestay?.name || 'Duly’s House';
  const payment = booking.payments?.[0];
  const canReview = booking.status === 'checked_out' && !booking.has_review;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-8">
        <Link
          to="/my-profile/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại lịch sử đặt phòng
        </Link>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-border">
            <CardHeader className="border-b border-border/60">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Mã đặt phòng
                  </p>
                  <CardTitle className="mt-1 font-headline text-3xl">{booking.booking_code}</CardTitle>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBlock icon={Home} label="Cơ sở" value={homestayName} />
                <InfoBlock icon={Users} label="Số khách" value={`${booking.guest_count || 0} khách`} />
                <InfoBlock icon={CalendarDays} label="Nhận phòng" value={formatDate(booking.check_in_date)} />
                <InfoBlock icon={CalendarDays} label="Trả phòng" value={formatDate(booking.check_out_date)} />
              </div>

              <div className="rounded-[28px] border border-border bg-surface-container-low p-4">
                <h2 className="font-headline text-lg font-bold text-on-surface">Phòng đã đặt</h2>
                <div className="mt-3 divide-y divide-border/70">
                  {booking.details?.map((detail) => (
                    <div key={detail.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-on-surface">{detail.room_type?.name || 'Loại phòng'}</p>
                        <p className="text-sm text-on-surface-variant">
                          Số lượng: {detail.quantity} · {detail.nights} đêm
                        </p>
                        {detail.assigned_rooms?.length > 0 && (
                          <p className="text-xs text-on-surface-variant">
                            Phòng vật lý: {detail.assigned_rooms.map((room) => room.room_code).join(', ')}
                          </p>
                        )}
                      </div>
                      <PriceDisplay amount={detail.subtotal} className="font-headline font-bold text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border">
              <CardContent className="space-y-4 p-6">
                <div className="rounded-[28px] border border-dashed border-primary/25 bg-primary/5 p-5">
                  <p className="text-sm font-semibold text-on-surface">Tổng tiền</p>
                  <PriceDisplay amount={booking.total_amount} className="mt-2 font-headline text-3xl font-extrabold text-primary" />
                </div>

                <InfoBlock icon={CreditCard} label="Thanh toán" value={paymentLabel(payment?.status)} />
                {payment?.transfer_content && (
                  <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                    <p className="text-xs text-on-surface-variant">Nội dung chuyển khoản</p>
                    <p className="font-mono text-sm font-semibold text-on-surface">{payment.transfer_content}</p>
                  </div>
                )}

                {canReview && (
                  <Link to={`/my-profile/bookings/${booking.id}/review`}>
                    <Button className="w-full gap-2">
                      <MessageSquareText className="h-4 w-4" />
                      Đánh giá trải nghiệm
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoBlock({ icon, label, value }) {
  const Icon = icon;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-white px-4 py-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="font-semibold text-on-surface">{value}</p>
      </div>
    </div>
  );
}
