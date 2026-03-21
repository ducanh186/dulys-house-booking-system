import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, MapPin, Users, AlertCircle, CheckCircle, User, Lock, Phone, Mail, Inbox } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMyBookings, cancelBooking } from '../../api/bookings';
import { getProfile, updateProfile } from '../../api/profile';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import PriceDisplay from '../../components/common/PriceDisplay';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { cn } from '../../lib/utils';

const TABS = [
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'past', label: 'Đã qua' },
  { id: 'profile', label: 'Hồ sơ' },
];

const UPCOMING_STATUSES = ['pending', 'confirmed'];
const PAST_STATUSES = ['checked_in', 'checked_out', 'cancelled'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---- Booking Card ----

function BookingCard({ booking, onCancel }) {
  const canCancel = UPCOMING_STATUSES.includes(booking.status);

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-headline font-bold text-on-surface text-base tracking-wide">
                #{booking.booking_code}
              </span>
              <StatusBadge status={booking.status} />
            </div>

            {booking.homestay?.name && (
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mb-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{booking.homestay.name}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mb-1.5">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>
                {formatDate(booking.check_in_date)} &mdash; {formatDate(booking.check_out_date)}
              </span>
            </div>

            {booking.details?.length > 0 && (
              <div className="flex items-start gap-1.5 text-sm text-on-surface-variant">
                <Users className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {booking.details.map((d) => `${d.room_type?.name} x${d.quantity}`).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-on-surface-variant mb-0.5">Tổng tiền</p>
              <PriceDisplay
                amount={booking.total_amount}
                className="font-headline font-bold text-lg text-primary"
              />
            </div>

            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(booking)}
                className="text-xs"
              >
                Huỷ đặt phòng
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Bookings Tab ----

function BookingsTab({ bookings, loading, error, meta, onPageChange, onCancel, emptyMessage }) {
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <AlertCircle className="w-10 h-10 text-error" />
        <p className="text-on-surface-variant">{error}</p>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Inbox className="w-12 h-12 text-outline-variant" />
        <p className="text-on-surface-variant">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} onCancel={onCancel} />
      ))}
      <Pagination meta={meta} onPageChange={onPageChange} />
    </div>
  );
}

// ---- Profile Tab ----

function ProfileTab() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', password_confirmation: '' });
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setLoadingProfile(true);
    getProfile()
      .then((res) => {
        const p = res.data;
        setForm({ name: p.name || '', email: p.email || '', phone: p.phone || '' });
      })
      .catch((err) => {
        setProfileError(err.message || 'Không thể tải thông tin cá nhân.');
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setSaveError('');
    setFieldErrors({});

    const payload = { ...form };
    if (showPasswordFields && passwordForm.password) {
      payload.password = passwordForm.password;
      payload.password_confirmation = passwordForm.password_confirmation;
    }

    try {
      const res = await updateProfile(payload);
      const updated = res.data;
      setForm({ name: updated.name || '', email: updated.email || '', phone: updated.phone || '' });
      setPasswordForm({ password: '', password_confirmation: '' });
      setShowPasswordFields(false);
      setSuccessMsg(res.message || 'Cập nhật thông tin thành công!');
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setSaveError(err.message || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loadingProfile) return <LoadingSpinner />;

  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-error" />
        <p className="text-on-surface-variant">{profileError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card className="border-border">
        <CardContent className="p-6">
          <form onSubmit={handleSave} noValidate className="space-y-5">
            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

            <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2">
              <User className="w-4 h-4" />
              Thông tin cá nhân
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="block text-sm font-medium text-on-surface">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <Input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  disabled={saving}
                  placeholder="Nguyen Van A"
                  className={cn('pl-9', fieldErrors.name ? 'border-error' : '')}
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-error">{fieldErrors.name[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="block text-sm font-medium text-on-surface">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <Input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  disabled={saving}
                  placeholder="ban@email.com"
                  className={cn('pl-9', fieldErrors.email ? 'border-error' : '')}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-error">{fieldErrors.email[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="block text-sm font-medium text-on-surface">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <Input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFormChange}
                  disabled={saving}
                  placeholder="0901234567"
                  className={cn('pl-9', fieldErrors.phone ? 'border-error' : '')}
                />
              </div>
              {fieldErrors.phone && <p className="text-xs text-error">{fieldErrors.phone[0]}</p>}
            </div>

            <div className="border-t border-border pt-4">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                onClick={() => {
                  setShowPasswordFields((v) => !v);
                  setPasswordForm({ password: '', password_confirmation: '' });
                  setFieldErrors({});
                }}
              >
                <Lock className="w-4 h-4" />
                {showPasswordFields ? 'Huỷ đổi mật khẩu' : 'Đổi mật khẩu'}
              </button>

              {showPasswordFields && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="profile-password" className="block text-sm font-medium text-on-surface">
                      Mật khẩu mới
                    </label>
                    <Input
                      id="profile-password"
                      name="password"
                      type="password"
                      value={passwordForm.password}
                      onChange={handlePasswordChange}
                      disabled={saving}
                      placeholder="Tối thiểu 8 ký tự"
                      className={fieldErrors.password ? 'border-error' : ''}
                    />
                    {fieldErrors.password && (
                      <p className="text-xs text-error">{fieldErrors.password[0]}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profile-password-confirm" className="block text-sm font-medium text-on-surface">
                      Xác nhận mật khẩu mới
                    </label>
                    <Input
                      id="profile-password-confirm"
                      name="password_confirmation"
                      type="password"
                      value={passwordForm.password_confirmation}
                      onChange={handlePasswordChange}
                      disabled={saving}
                      placeholder="Nhập lại mật khẩu mới"
                      className={fieldErrors.password_confirmation ? 'border-error' : ''}
                    />
                    {fieldErrors.password_confirmation && (
                      <p className="text-xs text-error">{fieldErrors.password_confirmation[0]}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang lưu...
                </span>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Main Page ----

export default function MyBookingsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback((page = 1) => {
    setLoadingBookings(true);
    setBookingsError('');
    getMyBookings(page)
      .then((res) => {
        setAllBookings(res.data || []);
        setMeta(res.meta || null);
      })
      .catch((err) => {
        setBookingsError(err.message || 'Không thể tải danh sách đặt phòng.');
      })
      .finally(() => setLoadingBookings(false));
  }, []);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  function handlePageChange(page) {
    fetchBookings(page);
  }

  function handleCancelRequest(booking) {
    setCancelTarget(booking);
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id);
      setAllBookings((prev) =>
        prev.map((b) => (b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      setBookingsError(err.message || 'Huỷ đặt phòng thất bại. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  }

  const upcomingBookings = allBookings.filter((b) => UPCOMING_STATUSES.includes(b.status));
  const pastBookings = allBookings.filter((b) => PAST_STATUSES.includes(b.status));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Xin chào, {user?.name || 'bạn'}!
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Quản lý đặt phòng và thông tin cá nhân của bạn.
          </p>
        </div>

        <div className="flex border-b border-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              )}
            >
              {tab.label}
              {tab.id === 'upcoming' && upcomingBookings.length > 0 && !loadingBookings && (
                <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold">
                  {upcomingBookings.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'upcoming' && (
          <BookingsTab
            bookings={upcomingBookings}
            loading={loadingBookings}
            error={bookingsError}
            meta={upcomingBookings.length < allBookings.length ? null : meta}
            onPageChange={handlePageChange}
            onCancel={handleCancelRequest}
            emptyMessage="Bạn chưa có đơn đặt phòng nào sắp tới."
          />
        )}

        {activeTab === 'past' && (
          <BookingsTab
            bookings={pastBookings}
            loading={loadingBookings}
            error={bookingsError}
            meta={pastBookings.length < allBookings.length ? null : meta}
            onPageChange={handlePageChange}
            onCancel={() => {}}
            emptyMessage="Bạn chưa có lịch sử đặt phòng nào."
          />
        )}

        {activeTab === 'profile' && <ProfileTab />}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Huỷ đặt phòng"
        message={
          cancelTarget
            ? `Bạn có chắc muốn huỷ đơn đặt phòng #${cancelTarget.booking_code} không? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel={cancelling ? 'Đang huỷ...' : 'Huỷ đặt phòng'}
        destructive
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
