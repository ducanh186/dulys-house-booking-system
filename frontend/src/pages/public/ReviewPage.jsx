import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Home, CalendarDays, Star, MessageSquareText, ShieldCheck } from 'lucide-react';
import { getBooking } from '../../api/bookings';
import { createReview } from '../../api/reviews';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriceDisplay from '../../components/common/PriceDisplay';

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`h-12 w-12 rounded-2xl border transition-all ${
            star <= active
              ? 'border-amber-300 bg-amber-50 text-amber-500'
              : 'border-border bg-white text-slate-300'
          }`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star className="mx-auto h-5 w-5" fill={star <= active ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getBooking(bookingId);
        if (!alive) return;
        setBooking(res.data || null);
        if (res.data?.review) {
          setSubmitted(true);
          setRating(res.data.review.rating || 0);
          setComment(res.data.review.comment || '');
        }
      } catch (err) {
        if (!alive) return;
        setError(err?.message || 'Không thể tải dữ liệu đánh giá.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      setError('Vui lòng chọn số sao.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createReview({
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Gửi đánh giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-lg font-semibold text-on-surface">{error}</p>
            <Button variant="outline" onClick={() => navigate('/my-profile/bookings')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Về lịch sử đặt phòng
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const homestayName = booking?.homestay?.name || booking?.details?.[0]?.room_type?.homestay?.name || 'Homestay';
  const roomTypeName = booking?.details?.[0]?.room_type?.name || 'Loại phòng';

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.26),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.9),_transparent_32%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-6">
          <Link
            to="/my-profile/bookings"
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại lịch sử đặt phòng
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
            <Card className="border-border shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <MessageSquareText className="h-4 w-4" />
                  Đánh giá trải nghiệm lưu trú
                </div>
                <CardTitle className="font-headline text-3xl">
                  {submitted ? 'Cảm ơn bạn đã đánh giá' : 'Hãy chia sẻ trải nghiệm của bạn'}
                </CardTitle>
                <CardDescription>
                  Phản hồi của bạn giúp homestay cải thiện chất lượng dịch vụ.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {submitted ? (
                  <div className="rounded-[28px] border border-green-200 bg-green-50 p-5 text-green-900 space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      Đánh giá đã được ghi nhận
                    </div>
                    <p className="text-sm">
                      Cảm ơn bạn đã dành thời gian chia sẻ trải nghiệm. Quay lại trang đặt phòng để xem lịch sử.
                    </p>
                    <Button onClick={() => navigate('/my-profile/bookings')}>Về lịch sử đặt phòng</Button>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Xếp hạng của bạn</label>
                      <StarSelector value={rating} onChange={setRating} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Nhận xét</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={6}
                        placeholder="Chia sẻ cảm nhận của bạn về phòng, dịch vụ, không gian..."
                        className="min-h-[160px] w-full rounded-[28px] border border-border bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" className="flex-1" disabled={submitting || !rating}>
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </Button>
                      <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/my-profile/bookings')}>
                        Để sau
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="sticky top-4 border-border shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Home className="h-4 w-4" />
                  Thông tin đơn
                </div>
                <CardTitle className="font-headline text-2xl">{booking?.booking_code}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={booking?.status || 'checked_out'} />
                  {booking?.total_amount != null && (
                    <span className="text-sm text-on-surface-variant">
                      <PriceDisplay amount={booking.total_amount} className="font-semibold text-on-surface" />
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-[28px] border border-border bg-surface-container-low p-4 space-y-3">
                  <InfoRow label="Homestay" value={homestayName} />
                  <InfoRow label="Loại phòng" value={roomTypeName} />
                  <InfoRow label="Số khách" value={booking?.guest_count ? `${booking.guest_count} khách` : 'Không có'} />
                </div>

                <div className="rounded-[28px] border border-border bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Thời gian lưu trú
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    <p>Nhận phòng: <span className="font-semibold text-on-surface">{formatDate(booking?.check_in_date)}</span></p>
                    <p>Trả phòng: <span className="font-semibold text-on-surface">{formatDate(booking?.check_out_date)}</span></p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-4 text-sm text-on-surface-variant flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
                  <p>Đánh giá này chỉ gắn với homestay và đơn đặt phòng, không tách riêng theo từng phòng.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
