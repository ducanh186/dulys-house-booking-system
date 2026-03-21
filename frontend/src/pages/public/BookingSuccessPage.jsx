import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, BedDouble, Hash, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import PriceDisplay from '../../components/common/PriceDisplay';
import StatusBadge from '../../components/common/StatusBadge';

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  useEffect(() => {
    if (!state?.booking) {
      navigate('/my-bookings', { replace: true });
    }
  }, [state, navigate]);

  if (!state?.booking) return null;

  const { booking, homestayName, roomTypeName } = state;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Success icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface text-center">
            Đặt phòng thành công!
          </h1>
          <p className="text-on-surface-variant text-sm text-center mt-1">
            Yêu cầu đặt phòng của bạn đã được gửi. Chúng tôi sẽ xác nhận trong thời gian sớm nhất.
          </p>
        </div>

        {/* Booking detail card */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            {/* Booking code */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary-container">
              <div className="flex items-center gap-2 text-on-primary-container">
                <Hash className="h-4 w-4" />
                <span className="text-sm font-medium">Mã đặt phòng</span>
              </div>
              <span className="font-headline font-bold text-lg text-on-primary-container tracking-wider">
                {booking.booking_code}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Trạng thái</span>
              <StatusBadge status={booking.status || 'pending'} />
            </div>

            {/* Homestay name */}
            {homestayName && (
              <div className="flex items-start gap-2 text-sm">
                <Home className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-on-surface-variant">Homestay</p>
                  <p className="font-medium text-on-surface">{homestayName}</p>
                </div>
              </div>
            )}

            {/* Room type */}
            {roomTypeName && (
              <div className="flex items-start gap-2 text-sm">
                <BedDouble className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-on-surface-variant">Loại phòng</p>
                  <p className="font-medium text-on-surface">{roomTypeName}</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-on-surface-variant">Thời gian lưu trú</p>
                <p className="font-medium text-on-surface">
                  {formatDate(booking.check_in_date)}
                  {' '}&rarr;{' '}
                  {formatDate(booking.check_out_date)}
                </p>
              </div>
            </div>

            {/* Total amount */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-semibold text-on-surface">Tổng tiền</span>
              <span className="font-headline font-bold text-xl text-primary">
                <PriceDisplay amount={booking.total_amount} />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/my-bookings">
            <Button className="w-full" size="lg">
              Xem đặt phòng của tôi
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full" size="lg">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
