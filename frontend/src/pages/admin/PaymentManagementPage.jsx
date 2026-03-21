import { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { getPayments, createPayment } from '../../api/admin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import PriceDisplay from '../../components/common/PriceDisplay';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'transfer', label: 'Chuyển khoản' },
  { value: 'card', label: 'Thẻ thanh toán' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'success', label: 'Hoàn thành' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

function methodLabel(method) {
  return PAYMENT_METHOD_OPTIONS.find((o) => o.value === method)?.label || method;
}

function statusLabel(status) {
  return PAYMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

function paymentStatusClass(status) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function formatDatetime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EMPTY_FORM = {
  booking_id: '',
  amount: '',
  method: 'cash',
};

function PaymentForm({ onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      booking_id: form.booking_id.trim(),
      amount: parseFloat(form.amount) || 0,
      method: form.method,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-on-surface font-body">
            Mã đơn đặt phòng (ID) <span className="text-error">*</span>
          </label>
          <Input
            required
            value={form.booking_id}
            onChange={(e) => set('booking_id', e.target.value)}
            placeholder="UUID của đơn đặt phòng..."
          />
          <p className="text-xs text-on-surface-variant font-body">
            Nhập UUID của đơn đặt phòng cần thanh toán.
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Số tiền (VND) <span className="text-error">*</span>
          </label>
          <Input
            required
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            placeholder="500000"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Phương thức thanh toán <span className="text-error">*</span>
          </label>
          <select
            value={form.method}
            onChange={(e) => set('method', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-body"
          >
            {PAYMENT_METHOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Huỷ bỏ
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Tạo thanh toán'}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    setError(null);
    getPayments(page)
      .then((res) => {
        setPayments(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError('Không thể tải danh sách thanh toán.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  function openForm() {
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(data) {
    setSubmitting(true);
    setFormError(null);
    try {
      await createPayment(data);
      closeForm();
      fetchPayments();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">Quản lý thanh toán</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Theo dõi giao dịch và tạo thanh toán mới.
          </p>
        </div>
        {!showForm && (
          <Button onClick={openForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo thanh toán
          </Button>
        )}
      </div>

      {/* Inline Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-on-surface">Tạo thanh toán mới</CardTitle>
            <button
              onClick={closeForm}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            {formError && (
              <p className="text-sm text-error mb-4 font-body">{formError}</p>
            )}
            <PaymentForm onSubmit={handleSubmit} onCancel={closeForm} submitting={submitting} />
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-on-surface">Danh sách thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-sm text-error p-6 font-body">{error}</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-10 font-body">
              Chưa có giao dịch thanh toán nào.
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
                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Số tiền
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Phương thức
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Trạng thái
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Thời gian thanh toán
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border hover:bg-surface-container transition-colors"
                    >
                      <td className="px-4 py-4 font-mono font-semibold text-primary">
                        {p.booking?.booking_code ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-on-surface font-body">
                        {p.booking?.customer?.name ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-on-surface font-body">
                        <PriceDisplay amount={p.amount} />
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant font-body">
                        {methodLabel(p.method)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={paymentStatusClass(p.status)}>
                          {statusLabel(p.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant font-body">
                        {formatDatetime(p.paid_at)}
                      </td>
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
    </div>
  );
}
