import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  CheckCheck,
  CircleEllipsis,
  CircleX,
  Clock3,
  PlusCircle,
  Search,
  Users2,
} from 'lucide-react';
import {
  getAdminBookings,
  getRoomTypes,
  createOfflineBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  cancelAdminBooking,
  confirmPayment,
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
import { cn } from '../../lib/utils';

const ACTION_LOADING_KEY = {
  confirm: 'confirm',
  confirm_payment: 'confirm_payment',
  checkin: 'checkin',
  checkout: 'checkout',
  cancel: 'cancel',
};

const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  proof_uploaded: 'Chờ xác nhận TT',
  success: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
  refunded: 'Đã hoàn tiền',
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

function BookingCard({ booking, onConfirm, onConfirmPayment, onCheckIn, onCheckOut, onCancel, loadingKey, highlighted }) {
  const canConfirm = booking.status === 'pending';
  const canConfirmPayment = booking.status === 'payment_review';
  const canCheckIn = booking.status === 'confirmed';
  const canCheckOut = booking.status === 'checked_in';
  const canCancel = ['pending', 'pending_payment', 'payment_review', 'confirmed'].includes(booking.status);
  const latestPayment = booking.payments?.[0] ?? null;
  const proof = latestPayment?.proof_image_url ?? null;
  const paymentStatus = booking.payment_status || latestPayment?.status || 'pending';

  return (
    <Card
      id={`admin-booking-${booking.id}`}
      className={cn(
        'admin-card overflow-hidden',
        highlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
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
                Thanh toán: <span className="font-semibold text-on-surface">{PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}</span>
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Ghi chú: <span className="font-semibold text-on-surface">{booking.notes || 'Không có'}</span>
              </p>
              {proof && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Minh chứng TT</p>
                  <a href={proof} target="_blank" rel="noreferrer">
                    <img src={proof} alt="Minh chứng" className="max-h-32 rounded-xl border border-border object-contain" />
                  </a>
                </div>
              )}
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
              {canConfirmPayment && (
                <Button
                  onClick={() => onConfirmPayment(booking.id, booking.payments?.[0]?.id)}
                  disabled={!!loadingKey}
                  className="w-full gap-2 rounded-full bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCheck className="h-4 w-4" />
                  {loadingKey === `${booking.id}-${ACTION_LOADING_KEY.confirm_payment}` ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}
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

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'payment_review', label: 'Chờ xác nhận TT' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'checked_in', label: 'Nhận phòng' },
  { value: 'checked_out', label: 'Trả phòng' },
  { value: 'cancelled', label: 'Hủy phòng' },
  { value: 'expired', label: 'Hết hạn' },
];

function OfflineBookingForm({ onCreated }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [roomTypes, setRoomTypes] = useState([]);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    check_in: tomorrow.toISOString().slice(0, 10),
    check_out: dayAfterTomorrow.toISOString().slice(0, 10),
    guest_count: '1',
    room_type_id: '',
    quantity: '1',
    payment_method: 'transfer',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    getRoomTypes(1, { active_only: 1, per_page: 100 })
      .then((response) => {
        const list = normalizeCollection(response);
        if (!alive) return;
        setRoomTypes(list);
        setForm((prev) => ({ ...prev, room_type_id: prev.room_type_id || list[0]?.id || '' }));
      })
      .catch(() => {
        if (alive) setError('Không thể tải danh sách loại phòng.');
      });

    return () => {
      alive = false;
    };
  }, []);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.room_type_id) {
      setError('Vui lòng nhập khách hàng, số điện thoại và loại phòng.');
      return;
    }

    if (Number(form.guest_count) < 1 || Number(form.guest_count) > 4) {
      setError('Số khách chỉ được nhập từ 1 đến 4.');
      return;
    }

    setSubmitting(true);
    try {
      await createOfflineBooking({
        check_in: form.check_in,
        check_out: form.check_out,
        guest_count: Number(form.guest_count),
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim() || undefined,
        payment_method: form.payment_method,
        notes: form.notes.trim() || undefined,
        rooms: [{ room_type_id: form.room_type_id, quantity: Number(form.quantity || 1) }],
      });
      setMessage('Đã tạo đơn đặt phòng tạm giữ chờ thanh toán.');
      onCreated?.();
    } catch (err) {
      setError(err?.message || 'Không thể tạo đơn đặt phòng.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="admin-card">
      <CardHeader className="border-b border-border/60 px-6 py-5">
        <CardTitle className="flex items-center gap-2 font-headline text-lg font-extrabold text-on-surface">
          <PlusCircle className="h-5 w-5 text-primary" />
          Đặt phòng qua nhân viên
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="grid gap-3 lg:grid-cols-4">
          <input className="rounded-2xl border border-border px-4 py-3 text-sm" placeholder="Tên khách hàng" value={form.customer_name} onChange={(e) => updateField('customer_name', e.target.value)} />
          <input className="rounded-2xl border border-border px-4 py-3 text-sm" placeholder="Số điện thoại" value={form.customer_phone} onChange={(e) => updateField('customer_phone', e.target.value)} />
          <input className="rounded-2xl border border-border px-4 py-3 text-sm" placeholder="Email" type="email" value={form.customer_email} onChange={(e) => updateField('customer_email', e.target.value)} />
          <select className="rounded-2xl border border-border px-4 py-3 text-sm" value={form.room_type_id} onChange={(e) => updateField('room_type_id', e.target.value)}>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name} {roomType.homestay?.name ? `- ${roomType.homestay.name}` : ''}
              </option>
            ))}
          </select>
          <input className="rounded-2xl border border-border px-4 py-3 text-sm" type="date" min={new Date().toISOString().slice(0, 10)} value={form.check_in} onChange={(e) => updateField('check_in', e.target.value)} />
          <input className="rounded-2xl border border-border px-4 py-3 text-sm" type="date" min={form.check_in || new Date().toISOString().slice(0, 10)} value={form.check_out} onChange={(e) => updateField('check_out', e.target.value)} />
          <input className="rounded-2xl border border-border px-4 py-3 text-sm" type="number" min="1" max="4" value={form.guest_count} onChange={(e) => updateField('guest_count', e.target.value)} />
          <select className="rounded-2xl border border-border px-4 py-3 text-sm" value={form.payment_method} onChange={(e) => updateField('payment_method', e.target.value)}>
            <option value="transfer">Chuyển khoản</option>
            <option value="cash">Tiền mặt</option>
            <option value="card">Thẻ</option>
          </select>
          <input className="rounded-2xl border border-border px-4 py-3 text-sm lg:col-span-3" placeholder="Ghi chú" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
          <Button type="submit" disabled={submitting} className="rounded-full">
            {submitting ? 'Đang tạo...' : 'Tạo đơn'}
          </Button>
        </form>
        {message && <p className="mt-3 text-sm font-semibold text-success">{message}</p>}
        {error && <p className="mt-3 text-sm font-semibold text-error">{error}</p>}
      </CardContent>
    </Card>
  );
}

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, bookingId: null });
  const [serverSummary, setServerSummary] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') || '';
  const bookingIdFilter = searchParams.get('booking_id') || '';
  const searchFilter = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchFilter);

  async function fetchBookings() {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminBookings(page, {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(bookingIdFilter ? { booking_id: bookingIdFilter } : {}),
        ...(searchFilter ? { search: searchFilter } : {}),
      });
      setBookings(normalizeCollection(response));
      setMeta(response?.meta ?? null);
      setServerSummary(response?.meta?.summary ?? response?.summary ?? null);
    } catch {
      setError('Không thể tải danh sách đặt phòng.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, bookingIdFilter, searchFilter]);

  useEffect(() => {
    if (!bookingIdFilter || loading || error) return;
    window.requestAnimationFrame(() => {
      document.getElementById(`admin-booking-${bookingIdFilter}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }, [bookingIdFilter, bookings, loading, error]);

  async function runAction(actionKey, bookingId, actionFn) {
    setActionLoading(`${bookingId}-${actionKey}`);
    try {
      await actionFn(bookingId);
      await fetchBookings();
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setActionLoading('');
    }
  }

  const summary = useMemo(() => {
    const fallback = { total: bookings.length, pending: 0, pending_payment: 0, payment_review: 0, confirmed: 0, checked_in: 0, checked_out: 0, cancelled: 0, expired: 0 };
    for (const booking of bookings) {
      if (fallback[booking.status] != null) fallback[booking.status] += 1;
    }
    if (!serverSummary) return fallback;
    const serverCounts = serverSummary.status_counts ?? serverSummary;
    return {
      ...fallback,
      ...serverCounts,
      total: serverSummary.total ?? fallback.total,
    };
  }, [bookings, serverSummary]);

  function updateQuery(nextValues) {
    const params = new URLSearchParams(searchParams);
    Object.entries(nextValues).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }

  function handleStatusFilterChange(nextStatus) {
    updateQuery({
      status: nextStatus || null,
      page: 1,
      booking_id: null,
    });
  }

  function handlePageChange(nextPage) {
    updateQuery({ page: nextPage });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateQuery({
      search: searchInput.trim() || null,
      page: 1,
      booking_id: null,
    });
  }

  return (
    <div className="space-y-6">
      <section className="admin-card-soft rounded-[30px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="admin-kicker text-primary-dim">Booking operations</p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Quản lý đặt phòng
            </h1>
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

      <OfflineBookingForm onCreated={fetchBookings} />

      <Card className="admin-card">
        <CardHeader className="space-y-4 border-b border-border/60 px-6 py-5">
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
              Danh sách đặt phòng
            </CardTitle>
            <Badge className="admin-pill border-0 bg-primary-container text-on-primary-container">
              {meta?.total ?? bookings.length} đơn
            </Badge>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm theo mã đặt phòng hoặc tên khách"
                  className="w-full rounded-2xl border border-border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-full">
                Tìm
              </Button>
            </form>
            <Link to="/admin/bookings/history" className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low">
              Lịch sử đặt phòng
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.value}
                onClick={() => handleStatusFilterChange(statusFilter === sf.value ? '' : sf.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === sf.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {sf.label}
                {sf.value && summary[sf.value] != null && (
                  <span className="ml-1.5 opacity-75">({summary[sf.value]})</span>
                )}
              </button>
            ))}
          </div>
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
                  onConfirmPayment={(bookingId, paymentId) => runAction(ACTION_LOADING_KEY.confirm_payment, bookingId, () => confirmPayment(paymentId))}
                  onCheckIn={(id) => runAction(ACTION_LOADING_KEY.checkin, id, checkInBooking)}
                  onCheckOut={(id) => runAction(ACTION_LOADING_KEY.checkout, id, checkOutBooking)}
                  onCancel={(id) => setConfirmDialog({ open: true, bookingId: id })}
                  loadingKey={actionLoading}
                  highlighted={String(booking.id) === String(bookingIdFilter)}
                />
              ))}
            </div>
          )}

          {!loading && !error && meta && (
            <div className="mt-5 border-t border-border/60 pt-4">
              <Pagination meta={meta} onPageChange={handlePageChange} />
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
