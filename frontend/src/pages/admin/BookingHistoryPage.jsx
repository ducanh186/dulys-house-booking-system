import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { getAdminBookings } from '../../api/admin';
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

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    getAdminBookings(page, { per_page: 50 })
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
  }, [page]);

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
          <CardTitle className="flex items-center gap-2 font-headline text-lg font-extrabold text-on-surface">
            <CalendarDays className="h-5 w-5 text-primary" />
            Danh sách lịch sử
          </CardTitle>
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
