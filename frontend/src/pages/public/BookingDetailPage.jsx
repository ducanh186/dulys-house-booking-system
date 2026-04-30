import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, CreditCard, Home, MessageSquareText, ShieldCheck, Sparkles, Star } from 'lucide-react';
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
  const reviewPath = `/my-profile/bookings/${booking.id}/review`;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.24),_transparent_30%)]" />
      </div>
      <div className="relative mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10">
        <Link
          to="/my-profile/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại lịch sử đặt phòng
        </Link>

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <Card className="border-border shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <CardHeader className="space-y-4 px-6 pt-6 sm:px-8 sm:pt-8">
                <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  <Sparkles className="h-4 w-4" />
                  {panelEyebrow(booking.status, canReview)}
                </div>
                <CardTitle className="font-headline text-3xl leading-tight sm:text-4xl">{panelTitle(booking.status, canReview)}</CardTitle>
                <p className="max-w-2xl text-[15px] leading-7 text-on-surface-variant">
                  {panelDescription(booking, canReview)}
                </p>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
                {canReview ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-on-surface">Xếp hạng gợi ý</p>
                      <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={index} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-slate-300">
                            <Star className="h-5 w-5" />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-border bg-white px-5 py-5 text-[15px] leading-7 text-on-surface-variant">
                      Chia sẻ cảm nhận của bạn về phòng, dịch vụ và không gian để giúp homestay cải thiện trải nghiệm tốt hơn.
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link to={reviewPath} className="flex-1">
                        <Button className="w-full gap-2">
                          <MessageSquareText className="h-4 w-4" />
                          Gửi đánh giá
                        </Button>
                      </Link>
                      <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/my-profile/bookings')}>
                        Để sau
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {buildStatusSteps(booking, payment).map((step) => (
                      <div key={step.title} className="flex items-start gap-4 rounded-[28px] border border-border bg-white px-5 py-5">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
                          <step.icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[15px] font-semibold text-on-surface">{step.title}</p>
                          <p className="mt-1.5 text-[15px] leading-7 text-on-surface-variant">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
              <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
                <CardTitle className="font-headline text-xl">Hạng phòng đã đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
                {booking.details?.map((detail) => (
                  <div key={detail.id} className="rounded-[28px] border border-border bg-surface-container-low px-5 py-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[15px] font-semibold text-on-surface">{detail.room_type?.name || 'Loại phòng'}</p>
                        <p className="mt-1 text-[15px] leading-7 text-on-surface-variant">
                          Số lượng: {detail.quantity} · {detail.nights} đêm
                        </p>
                        {detail.assigned_rooms?.length > 0 && (
                          <p className="mt-1.5 text-sm text-on-surface-variant">
                            Phòng vật lý: {detail.assigned_rooms.map((room) => room.room_code).join(', ')}
                          </p>
                        )}
                      </div>
                      <PriceDisplay amount={detail.subtotal} className="font-headline font-bold text-primary" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4 border-border shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <CardHeader className="space-y-3 px-6 pt-6 sm:px-8 sm:pt-8">
                <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  <Home className="h-4 w-4" />
                  Thông tin đơn
                </div>
                <CardTitle className="font-headline text-3xl leading-tight">{booking.booking_code}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={booking.status} />
                  {booking.total_amount != null && (
                    <PriceDisplay amount={booking.total_amount} className="font-semibold text-on-surface" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-5 px-6 pb-6 sm:px-8 sm:pb-8">
                <div className="rounded-[30px] border border-border bg-surface-container-low p-5 space-y-3.5">
                  <DetailRow label="Homestay" value={homestayName} />
                  <DetailRow label="Loại phòng" value={booking.details?.[0]?.room_type?.name || 'Loại phòng'} />
                  <DetailRow label="Số khách" value={`${booking.guest_count || 0} khách`} />
                  <DetailRow label="Thanh toán" value={paymentLabel(payment?.status)} />
                </div>

                <div className="rounded-[30px] border border-border bg-white p-5 space-y-3.5">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-on-surface">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Thời gian lưu trú
                  </div>
                  <div className="space-y-1.5 text-[15px] leading-7 text-on-surface-variant">
                    <p>Nhận phòng: <span className="font-semibold text-on-surface">{formatDate(booking.check_in_date)}</span></p>
                    <p>Trả phòng: <span className="font-semibold text-on-surface">{formatDate(booking.check_out_date)}</span></p>
                  </div>
                </div>

                {payment?.transfer_content && (
                  <div className="rounded-[30px] border border-dashed border-primary/25 bg-primary/5 p-5">
                    <p className="text-xs text-on-surface-variant">Nội dung chuyển khoản</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-on-surface">{payment.transfer_content}</p>
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-[30px] border border-primary/20 bg-primary/5 p-5 text-[15px] leading-7 text-on-surface-variant">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
                  <p>Hãy lưu lại mã đơn và lịch lưu trú để tiện đối chiếu khi làm thủ tục tại homestay.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

function panelEyebrow(status, canReview) {
  if (canReview) return 'Đánh giá trải nghiệm lưu trú';

  const map = {
    confirmed: 'Đơn đã được xác nhận',
    checked_in: 'Chúc bạn có kỳ nghỉ vui vẻ',
    checked_out: 'Lưu trú đã hoàn tất',
    pending_payment: 'Đang chờ thanh toán',
    payment_review: 'Đang chờ đối soát',
    cancelled: 'Đơn đã bị hủy',
  };

  return map[status] || 'Theo dõi đơn đặt phòng';
}

function panelTitle(status, canReview) {
  if (canReview) return 'Hãy chia sẻ trải nghiệm của bạn';

  const map = {
    confirmed: 'Đơn đặt phòng của bạn đã được xác nhận',
    checked_in: 'Chúc bạn có một kỳ nghỉ thật trọn vẹn',
    checked_out: 'Cảm ơn bạn đã lưu trú tại Duly’s House',
    pending_payment: 'Đơn của bạn đang chờ thanh toán',
    payment_review: 'Chúng tôi đang xác minh thanh toán của bạn',
    cancelled: 'Đơn đặt phòng này đã được hủy',
  };

  return map[status] || 'Theo dõi chi tiết đơn đặt phòng';
}

function panelDescription(booking, canReview) {
  if (canReview) {
    return 'Phản hồi của bạn giúp homestay cải thiện chất lượng dịch vụ và hỗ trợ khách hàng sau có trải nghiệm tốt hơn.';
  }

  switch (booking.status) {
    case 'confirmed':
      return `Thông tin lưu trú cho đơn ${booking.booking_code} đã sẵn sàng. Hãy lưu lại mã đơn trước ngày nhận phòng.`;
    case 'checked_in':
      return 'Bạn đã hoàn tất thủ tục nhận phòng. Nếu cần hỗ trợ trong thời gian lưu trú, hãy liên hệ homestay.';
    case 'checked_out':
      return 'Lịch lưu trú đã hoàn tất. Bạn có thể kiểm tra lại thông tin đơn và lịch sử thanh toán ở khung bên cạnh.';
    case 'pending_payment':
      return 'Đơn đang chờ bạn hoàn tất thanh toán để giữ chỗ. Vui lòng kiểm tra thời hạn và thông tin chuyển khoản.';
    case 'payment_review':
      return 'Chúng tôi đã nhận được minh chứng thanh toán và đang đối soát. Bạn sẽ nhận thông báo ngay khi hoàn tất.';
    case 'cancelled':
      return 'Nếu bạn vẫn muốn lưu trú, hãy tạo một đơn đặt phòng mới với thời gian phù hợp.';
    default:
      return 'Tất cả thông tin quan trọng của đơn đặt phòng được tổng hợp ở đây để bạn tiện theo dõi.';
  }
}

function buildStatusSteps(booking, payment) {
  switch (booking.status) {
    case 'confirmed':
      return [
        {
          icon: CheckCircle2,
          title: 'Đơn đã được xác nhận',
          description: `Thông tin lưu trú cho mã ${booking.booking_code} đã được homestay chốt và giữ chỗ thành công.`,
        },
        {
          icon: CalendarDays,
          title: 'Chuẩn bị cho ngày nhận phòng',
          description: `Nhận phòng vào ${formatDate(booking.check_in_date)}. Hãy mang theo thông tin đơn để đối chiếu khi check-in.`,
        },
        {
          icon: CreditCard,
          title: 'Thanh toán đã hoàn tất',
          description: `Trạng thái hiện tại: ${paymentLabel(payment?.status)}.`,
        },
      ];
    case 'checked_in':
      return [
        {
          icon: CheckCircle2,
          title: 'Bạn đã nhận phòng thành công',
          description: 'Hệ thống đã ghi nhận trạng thái lưu trú hiện tại của bạn tại homestay.',
        },
        {
          icon: CalendarDays,
          title: 'Ngày trả phòng',
          description: `Lịch trả phòng dự kiến vào ${formatDate(booking.check_out_date)}.`,
        },
        {
          icon: Sparkles,
          title: 'Cần hỗ trợ trong kỳ lưu trú?',
          description: 'Bạn có thể liên hệ trực tiếp homestay nếu cần thêm tiện ích hoặc hỗ trợ phát sinh.',
        },
      ];
    case 'pending_payment':
      return [
        {
          icon: Clock3,
          title: 'Đang chờ thanh toán',
          description: 'Vui lòng hoàn tất chuyển khoản trước thời hạn để giữ chỗ cho đơn đặt phòng này.',
        },
        {
          icon: CreditCard,
          title: 'Kiểm tra thông tin chuyển khoản',
          description: 'Đảm bảo đúng số tiền và nội dung chuyển khoản để việc đối soát diễn ra nhanh hơn.',
        },
      ];
    case 'payment_review':
      return [
        {
          icon: Clock3,
          title: 'Chờ đối soát',
          description: 'Minh chứng thanh toán đã được gửi. Hệ thống đang chờ nhân viên xác minh.',
        },
        {
          icon: MessageSquareText,
          title: 'Bạn sẽ nhận thông báo mới',
          description: 'Ngay khi thanh toán được xác nhận, hệ thống sẽ cập nhật trạng thái đơn và gửi thông báo cho bạn.',
        },
      ];
    case 'cancelled':
      return [
        {
          icon: ShieldCheck,
          title: 'Đơn đã bị hủy',
          description: booking.cancel_reason || 'Đơn đặt phòng này hiện không còn hiệu lực.',
        },
      ];
    default:
      return [
        {
          icon: Sparkles,
          title: 'Thông tin đơn luôn được cập nhật',
          description: 'Bạn có thể quay lại trang này bất cứ lúc nào để theo dõi trạng thái mới nhất.',
        },
      ];
  }
}
