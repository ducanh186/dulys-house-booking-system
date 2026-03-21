import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BedDouble, Users, AlertCircle, ChevronLeft } from 'lucide-react';
import { createBooking } from '../../api/bookings';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import PriceDisplay from '../../components/common/PriceDisplay';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state;

  // Redirect if no booking data was passed
  useEffect(() => {
    if (!state?.homestayId) {
      navigate('/search', { replace: true });
    }
  }, [state, navigate]);

  const {
    homestayId = '',
    homestayName = '',
    roomTypeId = '',
    roomTypeName = '',
    checkIn = '',
    checkOut = '',
    nightlyRate = 0,
    quantity = 1,
  } = state || {};

  const nights = calculateNights(checkIn, checkOut);
  const totalAmount = nightlyRate * nights * quantity;

  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Prefill when user data loads
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_email: prev.customer_email || user.email || '',
        customer_phone: prev.customer_phone || user.phone || '',
      }));
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validate() {
    const errors = {};
    if (!form.customer_name.trim()) errors.customer_name = 'Vui lòng nhập họ tên.';
    if (!form.customer_phone.trim()) errors.customer_phone = 'Vui lòng nhập số điện thoại.';
    if (!form.customer_email.trim()) {
      errors.customer_email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) {
      errors.customer_email = 'Email không hợp lệ.';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        check_in: checkIn,
        check_out: checkOut,
        guest_count: quantity * 2,
        rooms: [{ room_type_id: roomTypeId, quantity }],
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim(),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };
      const res = await createBooking(payload);
      navigate('/booking/success', {
        state: {
          booking: res.data,
          homestayName,
          roomTypeName,
        },
        replace: true,
      });
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!state?.homestayId) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </button>

        <h1 className="font-headline text-2xl font-bold text-on-surface mb-6">Xác nhận đặt phòng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Summary */}
          <div className="lg:col-span-2 order-first">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="font-headline text-base">Tóm tắt đặt phòng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-1">Homestay</p>
                  <p className="font-semibold text-on-surface">{homestayName}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-1">Loại phòng</p>
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-on-surface">{roomTypeName}</span>
                  </div>
                  {quantity > 1 && (
                    <p className="text-xs text-on-surface-variant mt-0.5 pl-6">x {quantity} phòng</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-1">Thời gian lưu trú</p>
                  <div className="flex items-center gap-2 text-on-surface">
                    <Calendar className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <span>{formatDate(checkIn)}</span>
                    <span className="text-on-surface-variant">&rarr;</span>
                    <span>{formatDate(checkOut)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant pl-6">{nights} đêm lưu trú</p>
                </div>

                <div className="border-t border-border pt-3 space-y-1.5">
                  <div className="flex justify-between text-on-surface-variant">
                    <span><PriceDisplay amount={nightlyRate} /> x {nights} đêm</span>
                    <span>{quantity > 1 ? `x ${quantity}` : ''}</span>
                  </div>
                  <div className="flex justify-between font-bold text-on-surface text-base">
                    <span>Tổng cộng</span>
                    <PriceDisplay amount={totalAmount} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-base">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                {apiError && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      Họ và tên <span className="text-error">*</span>
                    </label>
                    <Input
                      name="customer_name"
                      value={form.customer_name}
                      onChange={handleChange}
                      placeholder="Nguyen Van A"
                      aria-invalid={!!formErrors.customer_name}
                    />
                    {formErrors.customer_name && (
                      <p className="text-xs text-error mt-1">{formErrors.customer_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      Số điện thoại <span className="text-error">*</span>
                    </label>
                    <Input
                      name="customer_phone"
                      type="tel"
                      value={form.customer_phone}
                      onChange={handleChange}
                      placeholder="0901234567"
                      aria-invalid={!!formErrors.customer_phone}
                    />
                    {formErrors.customer_phone && (
                      <p className="text-xs text-error mt-1">{formErrors.customer_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      Email <span className="text-error">*</span>
                    </label>
                    <Input
                      name="customer_email"
                      type="email"
                      value={form.customer_email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      aria-invalid={!!formErrors.customer_email}
                    />
                    {formErrors.customer_email && (
                      <p className="text-xs text-error mt-1">{formErrors.customer_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Yêu cầu đặc biệt, giờ nhận phòng dự kiến..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
