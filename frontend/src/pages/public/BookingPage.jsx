import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BedDouble, AlertCircle, ChevronLeft, Shield, Headphones, Landmark } from 'lucide-react';
import { createBooking } from '../../api/bookings';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import PriceDisplay from '../../components/common/PriceDisplay';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';

const PAYMENT_OPTIONS = [
  {
    value: 'transfer',
    label: 'Chuyển khoản',
    description: 'Giữ chỗ nhanh, xác nhận thanh toán sau.',
    icon: Landmark,
  },
];

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = useMemo(() => location.state?.bookingIntent || location.state || {}, [location.state]);

  useEffect(() => {
    if (!state?.homestayId || !state?.roomTypeId) {
      navigate('/search', { replace: true });
    }
  }, [state, navigate]);

  const {
    homestayName = '',
    roomTypeId = '',
    roomTypeName = '',
    roomImage = '',
    checkIn = '',
    checkOut = '',
    nightlyRate = 0,
    quantity = 1,
    guestCount: bookingGuestCount = 1,
  } = state || {};

  const nights = calculateNights(checkIn, checkOut);
  const subtotal = nightlyRate * nights;
  const totalAmount = subtotal * quantity;

  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    notes: '',
  });
  const [guestCount, setGuestCount] = useState(String(Math.min(4, Math.max(1, Number(bookingGuestCount || 1)))));
  const [paymentMethod, setPaymentMethod] = useState(state?.paymentMethod || 'transfer');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const customerNameRef = useRef(null);
  const customerPhoneRef = useRef(null);
  const customerEmailRef = useRef(null);
  const guestCountRef = useRef(null);
  const paymentMethodRef = useRef(null);

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

  function handleGuestCountChange(e) {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 1 && Number(value) <= 4)) {
      setGuestCount(value);
      if (formErrors.guest_count) {
        setFormErrors((prev) => ({ ...prev, guest_count: null }));
      }
    }
  }

  function focusFirstInvalidField(errors) {
    const order = [
      ['customer_name', customerNameRef],
      ['customer_phone', customerPhoneRef],
      ['customer_email', customerEmailRef],
      ['guest_count', guestCountRef],
      ['paymentMethod', paymentMethodRef],
    ];

    for (const [key, ref] of order) {
      if (errors[key]) {
        window.requestAnimationFrame(() => {
          ref.current?.focus?.();
        });
        return;
      }
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
    if (!guestCount || Number(guestCount) < 1 || Number(guestCount) > 4) {
      errors.guest_count = 'Vui lòng nhập số khách từ 1 đến 4.';
    }
    if (!paymentMethod) {
      errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán.';
    }
    return errors;
  }

  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();
    setApiError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      focusFirstInvalidField(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        check_in: checkIn,
        check_out: checkOut,
        guest_count: Number(guestCount),
        payment_method: paymentMethod,
        rooms: [{ room_type_id: roomTypeId, quantity }],
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim(),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };

      const res = await createBooking(payload);
      const bookingData = res.data;

      if (paymentMethod === 'transfer') {
        navigate('/booking/payment', {
          state: {
            booking: bookingData,
            homestayName,
            roomTypeName,
            roomImage,
          },
          replace: true,
        });
      } else {
        navigate('/booking/success', {
          state: {
            booking: bookingData,
            homestayName,
            roomTypeName,
            roomImage,
            paymentMethod,
          },
          replace: true,
        });
      }
    } catch (err) {
      setApiError(
        err?.message ||
        'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!state?.homestayId || !state?.roomTypeId) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface-container-low border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>
          </div>

          <div className="flex items-center justify-center gap-0 max-w-md mx-auto">
            <StepIndicator number={1} label="Chi tiết" active />
            <div className="flex-1 h-px bg-border mx-2" />
            <StepIndicator number={2} label="Thanh toán" active />
            <div className="flex-1 h-px bg-border mx-2" />
            <StepIndicator number={3} label="Xác nhận" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-8 items-start">
          <div className="space-y-6">
            <Card className="border-border shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Thông tin đặt phòng</CardTitle>
                <CardDescription>Kiểm tra lại thông tin trước khi thanh toán.</CardDescription>
              </CardHeader>
              <CardContent>
                {apiError && (
                  <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 mb-5 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                <form id="booking-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Họ và tên"
                      name="customer_name"
                      value={form.customer_name}
                      onChange={handleChange}
                      placeholder="Nguyen Van A"
                      error={formErrors.customer_name}
                      inputRef={customerNameRef}
                      required
                    />
                    <Field
                      label="Số điện thoại"
                      name="customer_phone"
                      type="tel"
                      value={form.customer_phone}
                      onChange={handleChange}
                      placeholder="0901234567"
                      error={formErrors.customer_phone}
                      inputRef={customerPhoneRef}
                      required
                    />
                  </div>

                  <Field
                    label="Số khách"
                    name="guest_count"
                    type="number"
                    value={guestCount}
                    onChange={handleGuestCountChange}
                    placeholder="1"
                    error={formErrors.guest_count}
                    inputRef={guestCountRef}
                    required
                    min="1"
                    max="4"
                    inputMode="numeric"
                  />

                  <Field
                    label="Email"
                    name="customer_email"
                    type="email"
                    value={form.customer_email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    error={formErrors.customer_email}
                    inputRef={customerEmailRef}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      Yêu cầu đặc biệt
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Giờ nhận phòng dự kiến, yêu cầu thêm giường phụ..."
                      className="flex w-full rounded-[28px] border border-input bg-background px-4 py-3 text-sm font-body ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Phương thức thanh toán <span className="text-error">*</span></CardTitle>
                <CardDescription>Chọn một cách thanh toán phù hợp với bạn.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = paymentMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      ref={option.value === PAYMENT_OPTIONS[0].value ? paymentMethodRef : undefined}
                      type="button"
                      onClick={() => setPaymentMethod(option.value)}
                      className={cn(
                        'w-full rounded-[28px] border px-4 py-4 text-left transition-all',
                        active
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-white hover:bg-surface-container-low'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn('mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl', active ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant')}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold text-on-surface">{option.label}</p>
                            {active && <span className="text-xs font-semibold text-primary">Đang chọn</span>}
                          </div>
                          <p className="mt-1 text-sm text-on-surface-variant">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {formErrors.paymentMethod && (
                  <p className="text-xs text-error">{formErrors.paymentMethod}</p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Shield className="h-4 w-4 text-tertiary" />
                <span>Bảo vệ đặt phòng của bạn</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Headphones className="h-4 w-4 text-tertiary" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-4">
            <Card className="overflow-hidden border-border shadow-[0_18px_60px_rgba(15,23,42,0.1)]">
              <div className="h-44 overflow-hidden">
                {roomImage ? (
                  <img src={roomImage} alt={roomTypeName || homestayName} className="h-full w-full object-cover" />
                ) : (
                  <ImagePlaceholder name={roomTypeName || homestayName} className="h-full w-full" size="md" />
                )}
              </div>

              <CardContent className="pt-5 space-y-4">
                <div>
                  <p className="font-headline font-bold text-on-surface text-lg">{homestayName}</p>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <BedDouble className="h-3.5 w-3.5" />
                    {roomTypeName}
                    {quantity > 1 && <span className="text-xs">x {quantity}</span>}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-surface-container-low p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-on-surface">
                    <Calendar className="h-3.5 w-3.5 text-on-surface-variant" />
                    <span>{formatDate(checkIn)}</span>
                    <span className="text-on-surface-variant">&rarr;</span>
                    <span>{formatDate(checkOut)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant pl-5.5">{nights} đêm lưu trú</p>
                </div>

                <div className="rounded-[24px] border border-border bg-white p-4 space-y-2 text-sm">
                  <p className="font-medium text-on-surface-variant">Chi tiết giá</p>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>{nights} đêm x <PriceDisplay amount={nightlyRate} /></span>
                    <PriceDisplay amount={subtotal} />
                  </div>
                  {quantity > 1 && (
                    <div className="flex justify-between text-on-surface-variant">
                      <span>x {quantity} phòng</span>
                      <PriceDisplay amount={totalAmount} />
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-dashed border-primary/25 bg-primary/5 p-4 flex justify-between items-center">
                  <span className="font-bold text-on-surface text-lg">Tổng cộng</span>
                  <span className="font-headline font-bold text-xl text-primary">
                    <PriceDisplay amount={totalAmount} />
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-4 h-auto text-base shadow-lg shadow-primary/20 gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang xử lý...
                    </span>
                  ) : (
                    <>
                      Xác nhận và thanh toán
                      <PriceDisplay amount={totalAmount} className="font-normal" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-xs align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  Giao dịch được bảo mật
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ number, label, active }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        active ? 'sunlight-gradient text-white' : 'bg-surface-container-highest text-on-surface-variant'
      }`}>
        {number}
      </div>
      <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
        {label}
      </span>
    </div>
  );
}

function Field({ label, error, required = false, inputRef, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-on-surface">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      <Input ref={inputRef} {...props} className={error ? 'border-error' : ''} />
      {error && <p className="text-xs text-error">{error}</p>}
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

function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
