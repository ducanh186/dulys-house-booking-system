import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCheck,
  CircleEllipsis,
  CircleX,
  Clock3,
  Users2,
} from 'lucide-react';
import {
  getAdminBookings,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  cancelAdminBooking,
} from '../../api/admin';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import PriceDisplay from '../../components/common/PriceDisplay';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

const ACTION_LOADING_KEY = {
  confirm: 'confirm',
  checkin: 'checkin',
  checkout: 'checkout',
  cancel: 'cancel',
};

function normalizeCollection(response) {
  const payload = response?.data ?? response ?? {};
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function SummaryCard({ icon, label, value, hint }) {
  const Icon = icon;
  Icon;

  return (
    <Card className="admin-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
            <p className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface">{value}</p>
            {hint && <p className="mt-2 text-sm text-on-surface-variant">{hint}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking, onConfirm, onCheckIn, onCheckOut, onCancel, loadingKey }) {
  const canConfirm = booking.status === 'pending';
  const canCheckIn = booking.status === 'confirmed';
  const canCheckOut = booking.status === 'checked_in';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <Card className="admin-card overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b border-border/60 bg-surface-container-low px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-lg font-extrabold tracking-tight text-primary-dim">
                  {booking.booking_code}
                </p>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-on-surface-variant">
                {booking.homestay?.name || 'Homestay'} - {booking.room_type?.name || booking.roomType?.name || 'Room type'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Tổng tiền</p>
              <p className="mt-1 font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                <PriceDisplay amount={booking.total_amount} />
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-surface-container-low px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Khách hàng</p>
                <p className="mt-2 font-semibold text-on-surface">{booking.customer?.name ?? '—'}</p>
                <p className="text-sm text-on-surface-variant">{booking.customer?.phone ?? booking.customer_phone ?? ''}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface-container-low px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Thời gian</p>
                <p className="mt-2 font-semibold text-on-surface">{formatDate(booking.check_in_date)}</p>
                <p className="text-sm text-on-surface-variant">đến {formatDate(booking.check_out_date)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface-container-low px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                <Users2 className="h-3.5 w-3.5" />
                Chi tiết đặt phòng
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(booking.details || booking.items || []).map((detail) => (
                  <span
                    key={detail.id ?? `${detail.room_type?.name}-${detail.quantity}`}
                    className="admin-pill rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface"
                  >
                    {detail.room_type?.name || detail.roomType?.name || 'Loại phòng'} x {detail.quantity}
                  </span>
                ))}
                {!(booking.details || booking.items || []).length && (
                  <span className="text-sm text-on-surface-variant">Không có chi tiết phòng.</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-surface-container-low px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                <Clock3 className="h-3.5 w-3.5" />
                Trạng thái vận hành
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">
                Thanh toán: <span className="font-semibold text-on-surface">{booking.payment_method || booking.paymentMethod || '—'}</span>
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Ghi chú: <span className="font-semibold text-on-surface">{booking.notes || 'Không có'}</span>
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {canConfirm && (
                <Button
                  onClick={() => onConfirm(booking.id)}
                  disabled={!!loadingKey}
                  className="w-full gap-2 rounded-full"
                >
                  <CheckCheck className="h-4 w-4" />
                  {loadingKey === `${booking.id}-${ACTION_LOADING_KEY.confirm}` ? 'Đang xác nhận...' : 'Xác nhận'}
                </Button>
              )}
              {canCheckIn && (
                <Button
                  onClick={() => onCheckIn(booking.id)}
                  disabled={!!loadingKey}
                  className="w-full gap-2 rounded-full"
                >
                  <CalendarDays className="h-4 w-4" />
                  {loadingKey === `${booking.id}-${ACTION_LOADING_KEY.checkin}` ? 'Đang nhận phòng...' : 'Nhận phòng'}
                </Button>
              )}
              {canCheckOut && (
                <Button
                  variant="outline"
                  onClick={() => onCheckOut(booking.id)}
                  disabled={!!loadingKey}
                  className="w-full gap-2 rounded-full"
                >
                  <CircleEllipsis className="h-4 w-4" />
                  {loadingKey === `${booking.id}-${ACTION_LOADING_KEY.checkout}` ? 'Đang trả phòng...' : 'Trả phòng'}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => onCancel(booking.id)}
                  disabled={!!loadingKey}
                  className="w-full gap-2 rounded-full"
                >
                  <CircleX className="h-4 w-4" />
                  {loadingKey === `${booking.id}-${ACTION_LOADING_KEY.cancel}` ? 'Đang hủy...' : 'Hủy'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, bookingId: null });

  async function fetchBookings() {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminBookings(page);
      const payload = response?.data ?? response ?? {};
      setBookings(normalizeCollection(response));
      setMeta(payload.meta ?? null);
    } catch {
      setError('Không thể tải danh sách đặt phòng.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function runAction(actionKey, bookingId, actionFn) {
    setActionLoading(`${bookingId}-${actionKey}`);
    try {
      await actionFn(bookingId);
      await fetchBookings();
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setActionLoading('');
    }
  }

  const summary = useMemo(() => {
    const counts = { total: bookings.length, pending: 0, confirmed: 0, checked_in: 0, checked_out: 0 };
    for (const booking of bookings) {
      if (counts[booking.status] != null) counts[booking.status] += 1;
    }
    return counts;
  }, [bookings]);

  return (
    <div className="space-y-6">
      <section className="admin-card-soft rounded-[30px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="admin-kicker text-primary-dim">Booking operations</p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Quản lý đặt phòng
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
              Xử lý xác nhận, nhận phòng và trả phòng trong một giao diện dạng thẻ, rõ trạng thái và phù hợp cả desktop lẫn mobile.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SummaryCard icon={Clock3} label="Chờ xác nhận" value={summary.pending} hint="Đơn cần duyệt" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Users2} label="Tổng đơn hiển thị" value={summary.total} hint="Trang hiện tại" />
        <SummaryCard icon={Clock3} label="Chờ xác nhận" value={summary.pending} hint="Cần phản hồi" />
        <SummaryCard icon={CheckCheck} label="Đã xác nhận" value={summary.confirmed} hint="Sẵn sàng check-in" />
        <SummaryCard icon={CalendarDays} label="Đang lưu trú" value={summary.checked_in} hint="Cần theo dõi" />
      </div>

      <Card className="admin-card">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60 px-6 py-5">
          <div>
            <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
              Danh sách đặt phòng
            </CardTitle>
            <p className="mt-1 text-sm text-on-surface-variant">
              Các thao tác chính được giữ nguyên, chỉ thay đổi cách trình bày.
            </p>
          </div>
          <Badge className="admin-pill border-0 bg-primary-container text-on-primary-container">{summary.total} đơn</Badge>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Chưa có đặt phòng nào"
              description="Khi có đơn mới, danh sách thẻ sẽ hiển thị ở đây để xác nhận và xử lý."
              className="min-h-[320px]"
            />
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onConfirm={(id) => runAction(ACTION_LOADING_KEY.confirm, id, confirmBooking)}
                  onCheckIn={(id) => runAction(ACTION_LOADING_KEY.checkin, id, checkInBooking)}
                  onCheckOut={(id) => runAction(ACTION_LOADING_KEY.checkout, id, checkOutBooking)}
                  onCancel={(id) => setConfirmDialog({ open: true, bookingId: id })}
                  loadingKey={actionLoading}
                />
              ))}
            </div>
          )}

          {!loading && !error && meta && (
            <div className="mt-5 border-t border-border/60 pt-4">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận huỷ đặt phòng"
        message="Bạn có chắc chắn muốn huỷ đơn đặt phòng này không? Hành động này không thể hoàn tác."
        confirmLabel="Huỷ đặt phòng"
        destructive
        onConfirm={async () => {
          const bookingId = confirmDialog.bookingId;
          setConfirmDialog({ open: false, bookingId: null });
          if (bookingId) {
            await runAction(ACTION_LOADING_KEY.cancel, bookingId, cancelAdminBooking);
          }
        }}
        onCancel={() => setConfirmDialog({ open: false, bookingId: null })}
      />
    </div>
  );
}
