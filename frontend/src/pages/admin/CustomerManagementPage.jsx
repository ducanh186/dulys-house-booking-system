import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Phone, Mail, BookOpen } from 'lucide-react';
import { getCustomers, getCustomer } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import PriceDisplay from '../../components/common/PriceDisplay';

function CustomerDetail({ customerId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCustomer(customerId)
      .then((res) => setDetail(res.data))
      .catch(() => setError('Không thể tải thông tin khách hàng.'))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-4 bg-surface-container-low">
          <LoadingSpinner />
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-4 bg-surface-container-low">
          <p className="text-sm text-error font-body">{error}</p>
        </td>
      </tr>
    );
  }

  const bookings = detail?.bookings || [];

  return (
    <tr>
      <td colSpan={5} className="px-6 py-4 bg-surface-container-low border-b border-border">
        <div className="max-w-3xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm font-body text-on-surface-variant">
              <Phone className="w-4 h-4 shrink-0" />
              <span>{detail?.phone || 'Không có'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-body text-on-surface-variant">
              <Mail className="w-4 h-4 shrink-0" />
              <span>{detail?.email || 'Không có'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-body text-on-surface-variant">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{detail?.bookings_count ?? 0} lần đặt phòng</span>
            </div>
          </div>

          {bookings.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-on-surface mb-2 font-body">
                Lịch sử đặt phòng gần đây:
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface-container">
                      <th className="text-left px-3 py-2 font-semibold text-on-surface-variant font-body">
                        Mã đặt phòng
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-on-surface-variant font-body">
                        Cơ sở
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-on-surface-variant font-body">
                        Ngày nhận
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-on-surface-variant font-body">
                        Trạng thái
                      </th>
                      <th className="text-right px-3 py-2 font-semibold text-on-surface-variant font-body">
                        Tổng tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 font-mono font-semibold text-primary">
                          {b.booking_code}
                        </td>
                        <td className="px-3 py-2 text-on-surface-variant font-body">
                          {b.homestay?.name ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-on-surface-variant font-body">
                          {b.check_in_date}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-on-surface font-body">
                          <PriceDisplay amount={b.total_amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <p className="text-sm text-on-surface-variant font-body italic">
              Khách hàng này chưa có đặt phòng nào.
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    setError(null);
    getCustomers(page)
      .then((res) => {
        setCustomers(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError('Không thể tải danh sách khách hàng.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface">Quản lý khách hàng</h1>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Xem thông tin và lịch sử đặt phòng của khách hàng.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-on-surface">Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-sm text-error p-6 font-body">{error}</p>
          ) : customers.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-10 font-body">
              Chưa có khách hàng nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low">
                    <th className="text-left px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Họ tên
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Số điện thoại
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Email
                    </th>
                    <th className="text-center px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Số lần đặt phòng
                    </th>
                    <th className="text-center px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <>
                      <tr
                        key={c.id}
                        className={`border-b border-border hover:bg-surface-container transition-colors cursor-pointer ${
                          expandedId === c.id ? 'bg-surface-container' : ''
                        }`}
                        onClick={() => toggleExpand(c.id)}
                      >
                        <td className="px-6 py-4 font-medium text-on-surface font-body">
                          {c.name}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-body">
                          {c.phone || '—'}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-body">
                          {c.email || '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {c.bookings_count ?? 0} đặt phòng
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            className="text-on-surface-variant hover:text-on-surface transition-colors"
                            aria-label={expandedId === c.id ? 'Thu gọn' : 'Mở rộng'}
                          >
                            {expandedId === c.id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedId === c.id && <CustomerDetail key={`detail-${c.id}`} customerId={c.id} />}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && meta && (
            <div className="p-4 border-t border-border">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
