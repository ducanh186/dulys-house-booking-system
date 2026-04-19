import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CalendarDays, Sparkles, MapPin, ShieldCheck, BedDouble } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getHomestay, searchAvailability } from '../../api/homestays';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PriceDisplay from '../../components/common/PriceDisplay';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import ReviewSection from '../../components/ReviewSection';
import { optimizeImageUrl } from '../../lib/utils';

export default function RoomDetailPage() {
  const { slug, roomTypeId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const bookingIntent = location.state?.bookingIntent || {};
  const initialCheckIn = bookingIntent.checkIn || searchParams.get('check_in') || '';
  const initialCheckOut = bookingIntent.checkOut || searchParams.get('check_out') || '';
  const initialQuantity = Math.max(1, Number(bookingIntent.quantity || 1));
  const guestCount = Math.min(4, Math.max(1, Number(bookingIntent.guestCount || searchParams.get('guests') || 1)));

  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [availableCount, setAvailableCount] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getHomestay(slug);
        if (!alive) return;
        setHomestay(res.data || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || 'Không thể tải chi tiết phòng.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  const roomType = homestay?.room_types?.find((item) => String(item.id) === String(roomTypeId));
  const rooms = roomType?.rooms || [];
  const availableRooms = rooms.filter((room) => {
    if (room?.status === 'maintenance' || room?.status === 'unavailable') return false;
    if (room?.cleanliness && room.cleanliness !== 'clean') return false;
    return true;
  });
  const maxRooms = availableRooms.length;
  const heroImage = rooms.find((room) => room.main_image)?.main_image || homestay?.thumbnail || '';
  const nights = calculateNights(checkIn, checkOut);
  const hasDateRange = !!checkIn && !!checkOut && nights > 0;
  const effectiveAvailableCount = hasDateRange ? (availableCount ?? 0) : maxRooms;
  const checkoutDisabled = availabilityLoading || (hasDateRange ? effectiveAvailableCount < 1 : maxRooms < 1);

  useEffect(() => {
    if (!homestay?.id || !roomType || !checkIn || !checkOut) {
      setAvailableCount(null);
      return;
    }

    let active = true;

    async function fetchAvailabilityForRoomType() {
      setAvailabilityLoading(true);
      try {
        const res = await searchAvailability({
          homestay_id: homestay.id,
          check_in: checkIn,
          check_out: checkOut,
          guests: guestCount,
        });

        if (!active) return;

        const match = (res.data || []).find((item) => String(item.room_type.id) === String(roomType.id));
        setAvailableCount(match?.available_count ?? 0);
      } catch {
        if (active) {
          setAvailableCount(0);
        }
      } finally {
        if (active) {
          setAvailabilityLoading(false);
        }
      }
    }

    fetchAvailabilityForRoomType();

    return () => {
      active = false;
    };
  }, [checkIn, checkOut, guestCount, homestay?.id, roomType]);

  useEffect(() => {
    if (!roomType) return;
    const nextLimit = checkIn && checkOut ? (availableCount ?? 0) : maxRooms;
    setQuantity((prev) => Math.max(1, Math.min(prev, nextLimit || 1)));
  }, [availableCount, checkIn, checkOut, maxRooms, roomType]);

  function buildBookingIntent() {
    return {
      homestayId: homestay?.id,
      homestaySlug: slug,
      homestayName: homestay?.name,
      roomTypeId: roomType?.id,
      roomTypeName: roomType?.name,
      roomImage: heroImage,
      nightlyRate: roomType?.nightly_rate || 0,
      quantity,
      guestCount,
      checkIn,
      checkOut,
    };
  }

  function handleCheckout() {
    if (!roomType || !homestay) return;

    setBookingError('');

    if (!checkIn) {
      setBookingError('Vui lòng chọn ngày nhận phòng trước khi tiếp tục.');
      window.requestAnimationFrame(() => checkInRef.current?.focus?.());
      return;
    }

    if (!checkOut) {
      setBookingError('Vui lòng chọn ngày trả phòng trước khi tiếp tục.');
      window.requestAnimationFrame(() => checkOutRef.current?.focus?.());
      return;
    }

    if (nights <= 0) {
      setBookingError('Ngày trả phòng phải sau ngày nhận phòng.');
      window.requestAnimationFrame(() => checkOutRef.current?.focus?.());
      return;
    }

    if (effectiveAvailableCount < 1) {
      setBookingError('Phòng này hiện không còn khả dụng trong khoảng thời gian bạn chọn.');
      return;
    }

    const bookingIntent = buildBookingIntent();

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/booking',
            state: bookingIntent,
          },
          bookingIntent,
          message: 'Đăng nhập để tiếp tục giữ phòng và thanh toán.',
        },
      });
      return;
    }

    navigate('/booking', {
      state: bookingIntent,
    });
  }

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-lg font-semibold text-on-surface">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!homestay || !roomType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-lg font-semibold text-on-surface">Không tìm thấy phòng bạn chọn.</p>
            <Button variant="outline" onClick={() => navigate(`/homestays/${slug}`)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại homestay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(254,215,102,0.30),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.85),_transparent_36%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-6">
          <Link
            to={`/homestays/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại homestay
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[36px] border border-border shadow-[0_24px_70px_rgba(15,23,42,0.12)] bg-white">
                <div className="relative h-[320px] sm:h-[420px]">
                  {heroImage ? (
                    <img
                      src={optimizeImageUrl(heroImage, 1440)}
                      alt={roomType.name}
                      className="h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      sizes="(min-width: 1024px) 56vw, 100vw"
                    />
                  ) : (
                    <ImagePlaceholder name={roomType.name} className="h-full w-full" size="lg" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                  <div className="absolute left-5 top-5 flex gap-2">
                    <Badge className="bg-white/90 text-on-surface border-0 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Phòng chi tiết
                    </Badge>
                    {roomType.rooms_count != null && (
                      <AvailabilityBadge count={hasDateRange ? (effectiveAvailableCount || 0) : maxRooms} />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {availableRooms.slice(0, 3).map((room) => (
                  <div key={room.id} className="overflow-hidden rounded-2xl border border-border bg-surface-container-low h-24">
                    {room.main_image ? (
                      <img
                        src={optimizeImageUrl(room.main_image, 360)}
                        alt={room.room_code || roomType.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1024px) 220px, 33vw"
                      />
                    ) : (
                      <ImagePlaceholder name={room.room_code || roomType.name} className="h-full w-full" size="sm" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card className="sticky top-4 border-border shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
              <CardHeader className="pb-4">
                <CardDescription className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  {homestay.address}
                </CardDescription>
                <CardTitle className="font-headline text-3xl font-bold text-on-surface">
                  {roomType.name}
                </CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="rounded-md px-3 py-1 text-xs font-bold">
                    {homestay.name}
                  </Badge>
                  <span className="text-sm font-medium text-on-surface">
                    <PriceDisplay amount={roomType.nightly_rate} className="font-semibold text-primary" /> / đêm
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-sm leading-6 text-on-surface-variant">
                  {roomType.description || homestay.description || 'Chi tiết phòng và tiện nghi sẽ được hiển thị ở đây.'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Sức chứa" value={`Tối đa ${roomType.max_guests} khách`} />
                  <Stat
                    label={checkIn && checkOut ? 'Phòng khả dụng' : 'Phòng hiện có'}
                    value={`${checkIn && checkOut ? (effectiveAvailableCount || 0) : (rooms.length || 0)} phòng`}
                  />
                </div>

                {!isAuthenticated && (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Bạn cần đăng nhập để đặt phòng.
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          navigate('/login', {
                            state: {
                              from: {
                                pathname: `/homestays/${slug}/rooms/${roomTypeId}`,
                                search: buildSearchParams(checkIn, checkOut, guestCount),
                              },
                              bookingIntent: buildBookingIntent(),
                            },
                          })
                        }
                      >
                        Đăng nhập để tiếp tục
                      </Button>
                    </div>
                  </div>
                )}

                <div className="rounded-[28px] border border-border bg-surface-container-low p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Chọn ngày lưu trú
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Ngày nhận phòng</label>
                      <Input
                        ref={checkInRef}
                        type="date"
                        value={checkIn}
                        onChange={(e) => {
                          setCheckIn(e.target.value);
                          setBookingError('');
                        }}
                        min={today()}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Ngày trả phòng</label>
                      <Input
                        ref={checkOutRef}
                        type="date"
                        value={checkOut}
                        onChange={(e) => {
                          setCheckOut(e.target.value);
                          setBookingError('');
                        }}
                        min={checkIn || today()}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-on-surface-variant">Số lượng phòng</p>
                      <p className="font-semibold text-on-surface">
                        {availabilityLoading ? 'Đang kiểm tra phòng trống...' : 'Chọn số phòng muốn đặt'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          className="h-9 w-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface-container transition-colors"
                        >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-on-surface">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => (effectiveAvailableCount ? Math.min(prev + 1, effectiveAvailableCount) : prev))}
                          disabled={!effectiveAvailableCount || quantity >= effectiveAvailableCount}
                          className="h-9 w-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface-container transition-colors"
                        >
                          +
                        </button>
                    </div>
                  </div>
                  {checkIn && checkOut && !availabilityLoading && effectiveAvailableCount < 1 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Phòng này hiện không còn khả dụng trong khoảng thời gian bạn chọn.
                    </div>
                  )}
                  {bookingError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {bookingError}
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] border border-dashed border-primary/25 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Giá phòng / đêm</span>
                    <PriceDisplay amount={roomType.nightly_rate} className="font-semibold text-on-surface" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>{nights > 0 ? `${nights} đêm x ${quantity} phòng` : 'Chưa chọn ngày'}</span>
                    <PriceDisplay amount={roomType.nightly_rate * nights * quantity} className="font-semibold text-on-surface" />
                  </div>
                  <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                    <span className="font-semibold text-on-surface">Tạm tính</span>
                    <span className="font-headline text-xl font-bold text-primary">
                      <PriceDisplay amount={roomType.nightly_rate * nights * quantity} />
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-3">
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={checkoutDisabled}
                >
                  Tiếp tục thanh toán
                </Button>
                <p className="text-xs text-center text-on-surface-variant flex items-center justify-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {hasDateRange
                    ? isAuthenticated
                      ? 'Phòng sẽ được giữ trong 15 phút sau khi tạo đơn'
                      : 'Đăng nhập để giữ phòng và thanh toán'
                    : 'Bấm tiếp tục để hệ thống nhắc ngày còn thiếu'}
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Tiện nghi và không gian</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(roomType.rooms || []).slice(0, 6).map((room) => (
                <div key={room.id} className="rounded-2xl border border-border bg-surface-container-low p-4">
                  <p className="font-semibold text-on-surface">{room.room_code || roomType.name}</p>
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                    {room.cleanliness ? `Tình trạng: ${room.cleanliness}` : 'Không gian riêng tư, phù hợp cho kỳ nghỉ thoải mái.'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Thông tin nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-on-surface-variant">
              <InfoRow label="Homestay" value={homestay.name} />
              <InfoRow label="Địa chỉ" value={homestay.address} />
              <InfoRow label="Loại phòng" value={roomType.name} />
              <InfoRow label="Giá/đêm" value={<PriceDisplay amount={roomType.nightly_rate} />} />
            </CardContent>
          </Card>
        </section>

        <ReviewSection homestaySlug={slug} />
      </div>
    </div>
  );
}

function AvailabilityBadge({ count }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-950 bg-emerald-900 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
      <BedDouble className="h-3.5 w-3.5 text-white" />
      Còn <span className="text-sm leading-none text-white">{count}</span> phòng trống
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-container-low px-4 py-3">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className="mt-1 text-sm font-semibold text-on-surface">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

function buildSearchParams(checkIn, checkOut, guests) {
  const params = new URLSearchParams();
  if (checkIn) params.set('check_in', checkIn);
  if (checkOut) params.set('check_out', checkOut);
  if (guests) params.set('guests', guests);
  return params.toString() ? `?${params.toString()}` : '';
}

function today() {
  return new Date().toISOString().split('T')[0];
}
