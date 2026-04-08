import { useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleSlash2,
  Layers3,
  MapPin,
  PenSquare,
  Shield,
  Sparkles,
} from 'lucide-react';
import { getRoomTypes, getRoomTypeCalendar, blockDates, unblockDates, createPriceOverride } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PriceDisplay from '../../components/common/PriceDisplay';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function normalizeCollection(response) {
  const payload = response?.data ?? response ?? {};
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function normalizeMonth(value) {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

function formatMonthLabel(value) {
  const { year, month } = normalizeMonth(value);
  return new Date(year, month - 1, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function statusTone(day) {
  if (day.is_blocked) {
    return {
      shell: 'border-amber-200 bg-amber-50 text-amber-900',
      badge: 'Bảo trì',
      accent: 'bg-amber-500',
      label: 'Bị chặn',
    };
  }

  if (day.available_count === 0) {
    return {
      shell: 'border-rose-200 bg-rose-50 text-rose-900',
      badge: 'Hết phòng',
      accent: 'bg-rose-500',
      label: 'Đã lấp đầy',
    };
  }

  return {
    shell: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    badge: 'Còn phòng',
    accent: 'bg-emerald-500',
    label: 'Sẵn sàng',
  };
}

function DayMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-container-low px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
      <p className="mt-2 text-lg font-extrabold tracking-tight text-on-surface">{value}</p>
    </div>
  );
}

export default function AvailabilityPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRT, setSelectedRT] = useState('');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [calendar, setCalendar] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;

    async function fetchRoomTypes() {
      setLoadingRooms(true);
      try {
        const response = await getRoomTypes(1, { active_only: 1, per_page: 100 });
        const list = normalizeCollection(response);
        if (!alive) return;
        setRoomTypes(list);
        if (list.length && !selectedRT) {
          setSelectedRT(list[0].id);
          setSelectedDay(null);
        }
      } catch {
        if (!alive) return;
        setRoomTypes([]);
      } finally {
        if (alive) setLoadingRooms(false);
      }
    }

    fetchRoomTypes();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedRT) return;

    let alive = true;
    setLoadingCalendar(true);
    getRoomTypeCalendar(selectedRT, month)
      .then((response) => {
        const list = normalizeCollection(response);
        if (!alive) return;
        setCalendar(list);
        setSelectedDay((current) => {
          if (!current) return list[0] ?? null;
          return list.find((day) => day.date === current.date) ?? list[0] ?? current;
        });
      })
      .catch(() => {
        if (!alive) return;
        setCalendar([]);
        setSelectedDay(null);
      })
      .finally(() => {
        if (alive) setLoadingCalendar(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedRT, month]);

  const [year, mon] = month.split('-').map(Number);
  const firstDayOfWeek = new Date(year, mon - 1, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const summary = useMemo(() => {
    const blocked = calendar.filter((day) => day.is_blocked).length;
    const soldOut = calendar.filter((day) => !day.is_blocked && Number(day.available_count) === 0).length;
    const open = calendar.filter((day) => !day.is_blocked && Number(day.available_count) > 0).length;
    return { blocked, soldOut, open };
  }, [calendar]);

  const selectedRoomType = roomTypes.find((item) => String(item.id) === String(selectedRT));
  const selectedTone = selectedDay ? statusTone(selectedDay) : null;
  const blockedDateId = selectedDay?.blocked_date_id || null;

  const prevMonth = () => {
    const next = new Date(year, mon - 2, 1);
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const next = new Date(year, mon, 1);
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  async function reloadCalendar() {
    const response = await getRoomTypeCalendar(selectedRT, month);
    const list = normalizeCollection(response);
    setCalendar(list);
    setSelectedDay((current) => {
      if (!current) return list[0] ?? null;
      return list.find((day) => day.date === current.date) ?? current;
    });
  }

  const handleBlock = async () => {
    setSubmitting(true);
    try {
      await blockDates(selectedRT, form);
      setModal(null);
      await reloadCalendar();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async () => {
    if (!blockedDateId) return;
    setSubmitting(true);
    try {
      await unblockDates(blockedDateId);
      await reloadCalendar();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePriceOverride = async () => {
    setSubmitting(true);
    try {
      await createPriceOverride(selectedRT, form);
      setModal(null);
      await reloadCalendar();
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRooms) {
    return <LoadingSpinner />;
  }

  if (!roomTypes.length) {
    return (
      <Card className="admin-card">
        <CardContent className="p-8">
          <EmptyState
            icon={Layers3}
            title="Chưa có loại phòng"
            description="Hệ thống chưa có room type để hiển thị lịch phòng."
            className="min-h-[360px]"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-card-soft overflow-hidden rounded-[30px]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.85fr] lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="admin-kicker text-primary-dim">Availability</span>
              <Sparkles className="h-4 w-4 text-primary-dim" />
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Quản lý lịch phòng
            </h1>
          </div>

          <Card className="admin-card self-start">
            <CardContent className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Loại phòng
                </label>
                <select
                  value={selectedRT}
                  onChange={(e) => {
                    setSelectedRT(e.target.value);
                    setSelectedDay(null);
                  }}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                >
                  {roomTypes.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name} {roomType.homestay?.name ? `- ${roomType.homestay.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Cơ sở đang xem
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">
                  {selectedRoomType?.homestay?.name || 'Tất cả cơ sở'}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedRoomType?.name || 'Chưa chọn'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <DayMetric label="Ngày sẵn sàng" value={summary.open} />
        <DayMetric label="Ngày lấp đầy" value={summary.soldOut} />
        <DayMetric label="Ngày bị chặn" value={summary.blocked} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="admin-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60 px-6 py-5">
            <div>
              <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                {formatMonthLabel(month)}
              </CardTitle>
              <p className="mt-1 text-sm text-on-surface-variant">Chọn một ngày để xem nhanh chi tiết</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth} className="gap-1.5 rounded-full">
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth} className="gap-1.5 rounded-full">
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                Còn phòng
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                Hết phòng
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                Bảo trì
              </span>
            </div>

            {loadingCalendar ? (
              <LoadingSpinner />
            ) : calendar.length ? (
              <div>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((weekday) => (
                    <div key={weekday} className="px-2 py-1 text-center text-xs font-semibold text-on-surface-variant">
                      {weekday}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))}

                  {calendar.map((day) => {
                    const tone = statusTone(day);
                    const isSelected = selectedDay?.date === day.date;
                    const isPast = day.date < today;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`min-h-[118px] rounded-3xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isPast ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-60' : tone.shell} ${
                          isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-white' : ''
                        } ${day.date === today ? 'shadow-[0_0_0_1px_rgba(110,89,0,0.15)]' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-current/70">
                              {new Date(day.date).getDate()}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-current/80">
                              {tone.badge}
                            </p>
                          </div>
                          <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${tone.accent}`} />
                        </div>

                        <div className="mt-4 space-y-1.5">
                          <div className="rounded-2xl bg-white/80 px-2 py-1 text-[11px] font-semibold text-on-surface">
                            {day.available_count}/{day.total_rooms} phòng
                          </div>
                          <p className="text-[11px] font-medium text-current/80">
                            {formatCurrency(day.price)}đ / đêm
                          </p>
                          {day.is_blocked && day.block_reason && (
                            <p className="line-clamp-2 text-[10px] text-current/70">{day.block_reason}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={CalendarRange}
                title="Không có dữ liệu lịch"
                description="Thử đổi tháng khác hoặc kiểm tra lại loại phòng đang chọn."
                className="min-h-[360px]"
              />
            )}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="border-b border-border/60 px-6 py-5">
            <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
              Chi tiết ngày
            </CardTitle>
            <p className="mt-1 text-sm text-on-surface-variant">
              Thông tin nhanh và hành động xử lý
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-5 sm:p-6">
            {!selectedDay ? (
              <EmptyState
                icon={Shield}
                title="Chọn một ngày"
                description="Màn chi tiết sẽ hiển thị trạng thái, số phòng trống và các hành động quản trị."
                className="min-h-[320px]"
              />
            ) : (
              <>
                <div className="rounded-[28px] border border-border/70 bg-surface-container-low p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="admin-kicker text-primary-dim">{selectedTone?.label || 'Trạng thái'}</p>
                      <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                        {formatDate(selectedDay.date)}
                      </h3>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {selectedRoomType?.name || 'Loại phòng'}
                      </p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-bold ${selectedTone?.shell || 'bg-white text-on-surface'}`}>
                      {selectedTone?.badge || 'Ngày'}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DayMetric label="Phòng trống" value={`${selectedDay.available_count}/${selectedDay.total_rooms}`} />
                    <DayMetric label="Đã đặt" value={selectedDay.booked_count ?? 0} />
                    <DayMetric label="Giá hiện tại" value={<PriceDisplay amount={selectedDay.price} />} />
                    <DayMetric label="Bảo trì" value={selectedDay.is_blocked ? 'Có' : 'Không'} />
                  </div>

                  {selectedDay.block_reason && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <div className="flex items-center gap-2 font-semibold">
                        <Shield className="h-4 w-4" />
                        Lý do chặn
                      </div>
                      <p className="mt-2 text-sm leading-6">{selectedDay.block_reason}</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {!selectedDay.is_blocked ? (
                    <Button
                      onClick={() => {
                        setForm({
                          date_from: selectedDay.date,
                          date_to: selectedDay.date,
                          reason: '',
                        });
                        setModal('block');
                      }}
                      className="gap-2 rounded-full"
                    >
                      <CircleSlash2 className="h-4 w-4" />
                      Chặn ngày
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleUnblock}
                      disabled={!blockedDateId || submitting}
                      className="gap-2 rounded-full"
                    >
                      <Shield className="h-4 w-4" />
                      Bỏ chặn
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setForm({
                        date_from: selectedDay.date,
                        date_to: selectedDay.date,
                        override_price: selectedDay.price,
                        reason: '',
                      });
                      setModal('price');
                    }}
                    className="gap-2 rounded-full"
                  >
                    <PenSquare className="h-4 w-4" />
                    Đặt giá riêng
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setModal(null);
            }
          }}
        >
          <div className="admin-card w-full max-w-md rounded-[28px] bg-white p-6">
            {modal === 'block' && (
              <div className="space-y-4">
                <div>
                  <p className="admin-kicker text-primary-dim">Chặn ngày</p>
                  <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                    Thêm khoảng chặn
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-on-surface">Từ ngày</label>
                    <input
                      type="date"
                      value={form.date_from || ''}
                      onChange={(e) => setForm((current) => ({ ...current, date_from: e.target.value }))}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-on-surface">Đến ngày</label>
                    <input
                      type="date"
                      value={form.date_to || ''}
                      onChange={(e) => setForm((current) => ({ ...current, date_to: e.target.value }))}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-on-surface">Lý do</label>
                    <textarea
                      rows={3}
                      value={form.reason || ''}
                      onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))}
                      className="w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                      placeholder="Bảo trì, sửa chữa, tạm ngưng..."
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setModal(null)} className="flex-1 rounded-full">
                    Hủy
                  </Button>
                  <Button onClick={handleBlock} disabled={submitting} className="flex-1 rounded-full">
                    {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                  </Button>
                </div>
              </div>
            )}

            {modal === 'price' && (
              <div className="space-y-4">
                <div>
                  <p className="admin-kicker text-primary-dim">Đặt giá riêng</p>
                  <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                    Điều chỉnh giá
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-on-surface">Từ ngày</label>
                    <input
                      type="date"
                      value={form.date_from || ''}
                      onChange={(e) => setForm((current) => ({ ...current, date_from: e.target.value }))}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-on-surface">Đến ngày</label>
                    <input
                      type="date"
                      value={form.date_to || ''}
                      onChange={(e) => setForm((current) => ({ ...current, date_to: e.target.value }))}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-on-surface">Giá mới</label>
                    <input
                      type="number"
                      value={form.override_price || ''}
                      onChange={(e) => setForm((current) => ({ ...current, override_price: e.target.value }))}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-on-surface">Lý do</label>
                    <input
                      type="text"
                      value={form.reason || ''}
                      onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                      placeholder="Cuối tuần, lễ, sự kiện..."
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setModal(null)} className="flex-1 rounded-full">
                    Hủy
                  </Button>
                  <Button onClick={handlePriceOverride} disabled={submitting} className="flex-1 rounded-full">
                    {submitting ? 'Đang xử lý...' : 'Lưu giá'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
