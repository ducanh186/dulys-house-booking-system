import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { getAdminBookings, getCustomers } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import PriceDisplay from '../../components/common/PriceDisplay';

function normalizeCollection(response) {
  const payload = response?.data ?? response ?? {};
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
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

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'payment_review', label: 'Chờ xác nhận TT' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'checked_in', label: 'Đã nhận phòng' },
  { value: 'checked_out', label: 'Đã trả phòng' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'expired', label: 'Hết hạn' },
];

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getCustomers(1, { per_page: 100 })
      .then((response) => {
        if (alive) setCustomers(normalizeCollection(response));
      })
      .catch(() => {
        if (alive) setCustomers([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    getAdminBookings(page, {
      per_page: 50,
      ...(customerId ? { customer_id: customerId } : {}),
      ...(status ? { status } : {}),
    })
      .then((response) => {
        if (!alive) return;
        setBookings(normalizeCollection(response));
        setMeta(response?.meta ?? null);
      })
      .catch(() => {
        if (alive) setError('Không thể tải lịch sử đặt phòng.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [customerId, page, status]);

  function updateCustomerFilter(value) {
    setCustomerId(value);
    setPage(1);
  }

  function updateStatusFilter(value) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <section className="admin-card-soft rounded-[30px] p-6 sm:p-8">
        <p className="admin-kicker text-primary-dim">Booking history</p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Lịch sử đặt phòng
        </h1>
      </section>

      <Card className="admin-card">
        <CardHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <CardTitle className="flex items-center gap-2 font-headline text-lg font-extrabold text-on-surface">
              <CalendarDays className="h-5 w-5 text-primary" />
              Danh sách lịch sử
            </CardTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Khách hàng
                </label>
                <select
                  value={customerId}
                  onChange={(e) => updateCustomerFilter(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                >
                  <option value="">Tất cả khách hàng</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name || customer.full_name || customer.phone || customer.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => updateStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="p-6 text-sm text-error">{error}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low">
                    <tr className="border-b border-border/60 text-left">
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Mã đặt phòng</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">ID khách hàng</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Tên khách hàng</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Cơ sở</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Ngày đặt phòng</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Ngày nhận phòng</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Ngày trả phòng</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Trạng thái</th>
                      <th className="px-5 py-4 font-semibold text-on-surface-variant">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border/50 last:border-0">
                        <td className="px-5 py-4 font-mono font-semibold text-primary-dim">{booking.booking_code}</td>
                        <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">{booking.customer?.id || '—'}</td>
                        <td className="px-5 py-4 font-semibold text-on-surface">{booking.customer?.name || booking.customer?.full_name || '—'}</td>
                        <td className="px-5 py-4 font-semibold text-on-surface">{booking.homestay?.name || 'Chưa xác định'}</td>
                        <td className="px-5 py-4 text-on-surface-variant">{formatDate(booking.created_at || booking.createdAt)}</td>
                        <td className="px-5 py-4 text-on-surface-variant">{formatDate(booking.check_in_date)}</td>
                        <td className="px-5 py-4 text-on-surface-variant">{formatDate(booking.check_out_date)}</td>
                        <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                        <td className="px-5 py-4 font-semibold text-on-surface"><PriceDisplay amount={booking.total_amount} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {meta && (
                <div className="border-t border-border/60 p-5">
                  <Pagination meta={meta} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
