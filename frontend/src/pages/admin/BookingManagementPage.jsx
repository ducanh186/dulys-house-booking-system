import { useState, useEffect, useCallback } from 'react';
import {
  getAdminBookings,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  cancelAdminBooking,
} from '../../api/admin';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import PriceDisplay from '../../components/common/PriceDisplay';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, bookingId: null });

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminBookings(page)
      .then((res) => {
        setBookings(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError('Không thể tải danh sách đặt phòng.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleAction(action, id) {
    setActionLoading(id + action);
    try {
      await action(id);
      fetchBookings();
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  }

  function handleConfirm(id) {
    handleAction(confirmBooking, id);
  }

  function handleCheckIn(id) {
    handleAction(checkInBooking, id);
  }

  function handleCheckOut(id) {
    handleAction(checkOutBooking, id);
  }

  function openCancelDialog(id) {
    setConfirmDialog({ open: true, bookingId: id });
  }

  function handleCancelConfirm() {
    const id = confirmDialog.bookingId;
    setConfirmDialog({ open: false, bookingId: null });
    handleAction(cancelAdminBooking, id);
  }

  function renderActions(booking) {
    const isLoading = (action) => actionLoading === booking.id + action;

    if (booking.status === 'pending') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleConfirm(booking.id)}
            disabled={!!actionLoading}
          >
            {isLoading(confirmBooking) ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openCancelDialog(booking.id)}
            disabled={!!actionLoading}
          >
            Huỷ
          </Button>
        </div>
      );
    }

    if (booking.status === 'confirmed') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleCheckIn(booking.id)}
            disabled={!!actionLoading}
          >
            {isLoading(checkInBooking) ? 'Đang xử lý...' : 'Nhận phòng'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openCancelDialog(booking.id)}
            disabled={!!actionLoading}
          >
            Huỷ
          </Button>
        </div>
      );
    }

    if (booking.status === 'checked_in') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleCheckOut(booking.id)}
          disabled={!!actionLoading}
        >
          {isLoading(checkOutBooking) ? 'Đang xử lý...' : 'Trả phòng'}
        </Button>
      );
    }

    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface">Quản lý đặt phòng</h1>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Xem và xử lý các đơn đặt phòng.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-on-surface">Danh sách đặt phòng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-sm text-error p-6 font-body">{error}</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-10 font-body">
              Chưa có đặt phòng nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low">
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Mã đặt phòng
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Khách hàng
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Cơ sở
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Ngày nhận / trả
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Trạng thái
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Tổng tiền
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border hover:bg-surface-container transition-colors"
                    >
                      <td className="px-4 py-4 font-mono font-semibold text-primary">
                        {b.booking_code}
                      </td>
                      <td className="px-4 py-4 font-body">
                        <p className="font-medium text-on-surface">{b.customer?.name ?? '—'}</p>
                        <p className="text-xs text-on-surface-variant">{b.customer?.phone ?? ''}</p>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant font-body">
                        {b.homestay?.name ?? '—'}
                      </td>
                      <td className="px-4 py-4 font-body">
                        <p className="text-on-surface">{b.check_in_date}</p>
                        <p className="text-xs text-on-surface-variant">→ {b.check_out_date}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-on-surface font-body">
                        <PriceDisplay amount={b.total_amount} />
                      </td>
                      <td className="px-4 py-4 text-center">{renderActions(b)}</td>
                    </tr>
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

      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận huỷ đặt phòng"
        message="Bạn có chắc chắn muốn huỷ đơn đặt phòng này không? Hành động này không thể hoàn tác."
        confirmLabel="Huỷ đặt phòng"
        destructive
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmDialog({ open: false, bookingId: null })}
      />
    </div>
  );
}
