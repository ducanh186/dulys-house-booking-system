import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays, AlertCircle, CheckCircle, User, Lock, Phone, Mail,
  Inbox, Settings, History, Headphones, LogOut, Plus, Star,
} from 'lucide-react';
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
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import { cn } from '../../lib/utils';

const UPCOMING_STATUSES = ['pending', 'confirmed'];
const PAST_STATUSES = ['checked_in', 'checked_out', 'cancelled'];
const PROFILE_PATH = '/my-profile';
const BOOKINGS_PATH = '/my-profile/bookings';

function reviewPath(bookingId) {
  return `${BOOKINGS_PATH}/${bookingId}/review`;
}

function detailPath(bookingId) {
  return `${BOOKINGS_PATH}/${bookingId}`;
}

const NAV_ITEMS = [
  { id: 'profile', label: 'Cài đặt cá nhân', icon: Settings, to: PROFILE_PATH },
  { id: 'bookings', label: 'Lịch sử đặt phòng', icon: History, to: BOOKINGS_PATH },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

// ─── Sidebar ─────────────────────────────────────────────

function ProfileSidebar({ user, activeTab, onLogout }) {
  return (
    <aside className="space-y-6">
      {/* Avatar + Welcome */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full sunlight-gradient flex items-center justify-center text-white font-bold text-lg shrink-0">
          {getInitials(user?.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-on-surface truncate text-sm">
            Chào, {user?.name || 'bạn'}
          </p>
          <p className="text-xs text-on-surface-variant">Tài khoản khách</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors text-left',
                active
                  ? 'bg-primary-container/60 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Book New Stay */}
      <Link
        to="/search"
        className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-sm font-semibold sunlight-gradient text-white hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        Đặt phòng mới
      </Link>

      {/* Footer links */}
      <div className="space-y-1 pt-2 border-t border-border">
        <Link
          to="/support/contact"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors text-left"
        >
          <Headphones className="w-4 h-4" />
          Hỗ trợ
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-red-600 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

// ─── Profile Section ─────────────────────────────────────

function ProfileSection({ user, bookingCount, onProfileSaved }) {
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
      if (onProfileSaved) {
        try {
          await onProfileSaved();
        } catch (error) {
          console.error(error);
        }
      }
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

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">Hồ sơ cá nhân</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Quản lý thông tin tài khoản và cài đặt bảo mật của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left: Avatar Card */}
        <Card className="border-border overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full sunlight-gradient flex items-center justify-center text-white font-bold text-2xl mb-3">
              {getInitials(form.name || user?.name)}
            </div>
            <p className="font-headline font-bold text-on-surface text-lg">{form.name || user?.name}</p>
            {memberSince && (
              <p className="text-xs text-on-surface-variant mt-1">Thành viên từ {memberSince}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <div className="text-center">
                <p className="font-headline font-bold text-on-surface text-lg">{bookingCount}</p>
                <p className="text-xs text-on-surface-variant">Chuyến đi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border-border">
            <CardContent className="p-6">
              <form onSubmit={handleSave} noValidate className="space-y-5">
                {successMsg && (
                  <div className="flex items-center gap-2 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {successMsg}
                  </div>
                )}
                {saveError && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-error">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {saveError}
                  </div>
                )}

                <h3 className="font-headline font-semibold text-on-surface text-lg">Thông tin cơ bản</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileField
                    id="profile-name"
                    label="Họ tên"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    disabled={saving}
                    placeholder="Nguyen Van A"
                    error={fieldErrors.name}
                    icon={User}
                  />
                  <ProfileField
                    id="profile-phone"
                    label="Số điện thoại"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                    disabled={saving}
                    placeholder="+84 901 234 567"
                    error={fieldErrors.phone}
                    icon={Phone}
                  />
                </div>

                <ProfileField
                  id="profile-email"
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  disabled={saving}
                  placeholder="ban@email.com"
                  error={fieldErrors.email}
                  icon={Mail}
                />

                {/* Password Section */}
                <div className="border-t border-border pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline font-semibold text-on-surface text-lg flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Đổi mật khẩu
                    </h3>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        setShowPasswordFields((v) => !v);
                        setPasswordForm({ password: '', password_confirmation: '' });
                        setFieldErrors({});
                      }}
                    >
                      {showPasswordFields ? 'Huỷ' : 'Thay đổi'}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          placeholder="••••••••"
                          className={cn(
                            'bg-surface-container-highest/50 border-0',
                            fieldErrors.password ? 'ring-2 ring-red-400' : ''
                          )}
                        />
                        {fieldErrors.password && (
                          <p className="text-xs text-error">{fieldErrors.password[0]}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="profile-password-confirm" className="block text-sm font-medium text-on-surface">
                          Xác nhận mật khẩu
                        </label>
                        <Input
                          id="profile-password-confirm"
                          name="password_confirmation"
                          type="password"
                          value={passwordForm.password_confirmation}
                          onChange={handlePasswordChange}
                          disabled={saving}
                          placeholder="••••••••"
                          className={cn(
                            'bg-surface-container-highest/50 border-0',
                            fieldErrors.password_confirmation ? 'ring-2 ring-red-400' : ''
                          )}
                        />
                        {fieldErrors.password_confirmation && (
                          <p className="text-xs text-error">{fieldErrors.password_confirmation[0]}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {!showPasswordFields && (
                    <p className="text-sm text-on-surface-variant">
                      Lưu ý: mật khẩu mới cần ít nhất 6 ký tự, bao gồm chữ thường và số.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      getProfile().then((res) => {
                        const p = res.data;
                        setForm({ name: p.name || '', email: p.email || '', phone: p.phone || '' });
                      });
                      setPasswordForm({ password: '', password_confirmation: '' });
                      setShowPasswordFields(false);
                      setFieldErrors({});
                      setSuccessMsg('');
                      setSaveError('');
                    }}
                    disabled={saving}
                  >
                    Huỷ bỏ
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang lưu...
                      </span>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ id, label, icon: Icon, error, ...inputProps }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-on-surface">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
        )}
        <Input
          id={id}
          {...inputProps}
          className={cn(
            'bg-surface-container-highest/50 border-0',
            Icon ? 'pl-9' : '',
            error ? 'ring-2 ring-red-400' : ''
          )}
        />
      </div>
      {error && <p className="text-xs text-error">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  );
}

// ─── Bookings Section ────────────────────────────────────

function BookingsSection({ allBookings, loadingBookings, bookingsError, meta, onPageChange, onCancel, highlightBookingId }) {
  const upcomingBookings = allBookings.filter((b) => UPCOMING_STATUSES.includes(b.status));
  const pastBookings = allBookings.filter((b) => PAST_STATUSES.includes(b.status));

  useEffect(() => {
    if (!highlightBookingId || loadingBookings || bookingsError) return;
    window.requestAnimationFrame(() => {
      document.getElementById(`booking-${highlightBookingId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }, [highlightBookingId, loadingBookings, bookingsError, allBookings]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">Lịch sử đặt phòng</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Xem lại những chuyến đi tuyệt vời của bạn và quản lý các lượt đặt phòng sắp tới tại Duly's House.
        </p>
      </div>

      {loadingBookings && <LoadingSpinner />}

      {bookingsError && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <AlertCircle className="w-10 h-10 text-error" />
          <p className="text-on-surface-variant">{bookingsError}</p>
        </div>
      )}

      {!loadingBookings && !bookingsError && (
        <>
          {/* Upcoming */}
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-on-surface text-lg">Sắp tới</h2>
            {upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3 text-center rounded-3xl bg-surface-container-low">
                <Inbox className="w-10 h-10 text-outline-variant" />
                <p className="text-on-surface-variant text-sm">Bạn chưa có đơn đặt phòng nào sắp tới.</p>
                <Link to="/search">
                  <Button size="sm">Tìm phòng ngay</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((b) => (
                  <UpcomingBookingCard
                    key={b.id}
                    booking={b}
                    onCancel={onCancel}
                    highlighted={String(b.id) === String(highlightBookingId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-on-surface text-lg">Chuyến đi trước đây</h2>
            {pastBookings.length === 0 ? (
              <p className="text-on-surface-variant text-sm py-6">Chưa có lịch sử chuyến đi nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pastBookings.map((b) => (
                  <PastBookingCard
                    key={b.id}
                    booking={b}
                    highlighted={String(b.id) === String(highlightBookingId)}
                  />
                ))}
              </div>
            )}
          </div>

          <Pagination meta={meta} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}

function UpcomingBookingCard({ booking, onCancel, highlighted }) {
  const canCancel = UPCOMING_STATUSES.includes(booking.status);
  const roomName = booking.details?.[0]?.room_type?.name || '';
  const homestayName = booking.homestay?.name || '';

  return (
    <Card
      id={`booking-${booking.id}`}
      className={cn(
        'border-border overflow-hidden',
        highlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-56 h-44 sm:h-auto shrink-0 overflow-hidden">
          <ImagePlaceholder name={homestayName || roomName} className="h-full w-full" size="lg" />
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-headline font-bold text-on-surface text-lg">{homestayName}</h3>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mb-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(booking.check_in_date)} — {formatDate(booking.check_out_date)}
            </p>
            {booking.details?.length > 0 && (
              <p className="text-sm text-on-surface-variant">
                {booking.details.map((d) => `${d.room_type?.name} x${d.quantity}`).join(', ')}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Link
                to={detailPath(booking.id)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-semibold h-8 px-4 sunlight-gradient text-white hover:opacity-90 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                Xem chi tiết
              </Link>
              {canCancel && (
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onCancel(booking)}>
                  Huỷ đặt phòng
                </Button>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">Tổng cộng</p>
              <PriceDisplay amount={booking.total_amount} className="font-headline font-bold text-lg text-primary" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function PastBookingCard({ booking, highlighted }) {
  const canReview = booking.status === 'checked_out' && !booking.review;
  const roomName = booking.details?.[0]?.room_type?.name || '';
  const homestayName = booking.homestay?.name || '';

  return (
    <Card
      id={`booking-${booking.id}`}
      className={cn(
        'border-border overflow-hidden',
        highlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Image */}
      <div className="h-36 overflow-hidden relative">
        <ImagePlaceholder name={homestayName || roomName} className="h-full w-full" size="md" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-headline font-semibold text-on-surface truncate">{homestayName || `#${booking.booking_code}`}</h3>
        <p className="text-xs text-on-surface-variant flex items-center gap-1">
          <CalendarDays className="w-3 h-3" />
          {formatDate(booking.check_in_date)} — {formatDate(booking.check_out_date)}
        </p>
        <PriceDisplay amount={booking.total_amount} className="font-bold text-primary" />

        <div className="flex items-center gap-2 pt-1">
          <Link
            to={detailPath(booking.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Xem chi tiết
          </Link>
          {canReview && (
            <Link
              to={reviewPath(booking.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Star className="w-3 h-3" />
              Đánh giá
            </Link>
          )}
          {booking.review && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Đã đánh giá
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function MyBookingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdFilter = searchParams.get('booking_id') || '';

  const [allBookings, setAllBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const activeTab = location.pathname.startsWith(BOOKINGS_PATH) ? 'bookings' : 'profile';

  const fetchBookings = useCallback((page = 1) => {
    setLoadingBookings(true);
    setBookingsError('');
    getMyBookings(page, bookingIdFilter ? { booking_id: bookingIdFilter } : {})
      .then((res) => {
        setAllBookings(res.data || []);
        setMeta(res.meta || null);
      })
      .catch((err) => {
        setBookingsError(err.message || 'Không thể tải danh sách đặt phòng.');
      })
      .finally(() => setLoadingBookings(false));
  }, [bookingIdFilter]);

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

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar — hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <ProfileSidebar
                user={user}
                activeTab={activeTab}
                onLogout={handleLogout}
              />
            </div>
          </div>

          {/* Mobile tab switcher */}
          <div className="lg:hidden flex border-b border-border mb-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="min-w-0">
            {activeTab === 'profile' && (
              <ProfileSection
                user={user}
                bookingCount={meta?.total ?? allBookings.length}
                onProfileSaved={refreshUser}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingsSection
                allBookings={allBookings}
                loadingBookings={loadingBookings}
                bookingsError={bookingsError}
                meta={meta}
                onPageChange={handlePageChange}
                onCancel={handleCancelRequest}
                highlightBookingId={bookingIdFilter}
              />
            )}
          </div>
        </div>
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
