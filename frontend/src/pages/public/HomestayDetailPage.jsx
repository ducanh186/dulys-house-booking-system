import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  BedDouble,
  Users,
  ChevronLeft,
  AlertCircle,
  Minus,
  Plus,
} from 'lucide-react';
import { getHomestay } from '../../api/homestays';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PriceDisplay from '../../components/common/PriceDisplay';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import { cn } from '../../lib/utils';
import ReviewSection from '../../components/ReviewSection';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

export default function HomestayDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';

  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // quantity per room type: { [roomTypeId]: number }
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getHomestay(slug);
        setHomestay(res.data);
        // default quantity = 1 for each room type
        const defaultQty = {};
        (res.data?.room_types || []).forEach((rt) => {
          defaultQty[rt.id] = 1;
        });
        setQuantities(defaultQty);
      } catch (err) {
        setError(err?.message || 'Không thể tải thông tin homestay. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  function getNights() {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
  }

  function handleRoomAction(roomType) {
    const qty = quantities[roomType.id] || 1;
    const target = {
      pathname: `/homestays/${slug}/rooms/${roomType.id}`,
      search: buildSearchParams(checkIn, checkOut),
    };
    const bookingIntent = {
      homestayId: homestay.id,
      homestaySlug: slug,
      homestayName: homestay.name,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      roomImage: roomType.rooms?.find((room) => room.main_image)?.main_image || roomType.thumbnail || homestay.thumbnail,
      checkIn,
      checkOut,
      nightlyRate: roomType.nightly_rate,
      quantity: qty,
    };

    if (!isAuthenticated) {
      showToast('Bạn cần đăng nhập để đặt phòng', 'warning');
      navigate('/login', {
        state: {
          from: target,
          bookingIntent,
        },
      });
      return;
    }

    navigate(`${target.pathname}${target.search}`, {
      state: { bookingIntent },
    });
  }

  function changeQty(roomTypeId, delta) {
    setQuantities((prev) => ({
      ...prev,
      [roomTypeId]: Math.max(1, (prev[roomTypeId] || 1) + delta),
    }));
  }

  const nights = getNights();
  const hasDateParams = checkIn && checkOut;

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" />
          <p className="font-semibold text-red-700">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!homestay) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-surface-container-highest">
        {homestay.thumbnail ? (
          <img
            src={homestay.thumbnail}
            alt={homestay.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder name={homestay.name} className="h-full w-full" size="lg" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Homestay info */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
                {homestay.name}
              </h1>
              <Badge
                className={cn(
                  homestay.is_active
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                )}
              >
                {homestay.is_active ? 'Đang hoạt động' : 'Tạm đóng'}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant mb-3">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">{homestay.address}</span>
            </div>
            {homestay.description && (
              <p className="text-on-surface-variant leading-relaxed">{homestay.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 text-sm text-on-surface-variant shrink-0">
            {homestay.hotline && (
              <a href={`tel:${homestay.hotline}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                {homestay.hotline}
              </a>
            )}
            {homestay.email && (
              <a href={`mailto:${homestay.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                {homestay.email}
              </a>
            )}
          </div>
        </div>

        {/* Date summary if params exist */}
        {hasDateParams && (
          <div className="rounded-lg bg-primary-container border border-primary/20 px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-on-primary-container">
            <span>
              Kiểm tra phòng trống thời gian:{' '}
              <strong>{formatDate(checkIn)}</strong>
              {' '}&rarr;{' '}
              <strong>{formatDate(checkOut)}</strong>
            </span>
            {nights > 0 && (
              <Badge className="bg-primary/20 text-on-primary-container border-primary/20">
                {nights} đêm
              </Badge>
            )}
          </div>
        )}

        {/* Room types */}
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
            Loại phòng
          </h2>
          {(!homestay.room_types || homestay.room_types.length === 0) ? (
            <div className="text-center py-12 text-on-surface-variant">
              <BedDouble className="mx-auto h-10 w-10 mb-2" />
              <p>Chưa có loại phòng nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {homestay.room_types.map((rt) => (
                <RoomTypeCard
                  key={rt.id}
                  roomType={rt}
                  hasDateParams={hasDateParams}
                  nights={nights}
                  quantity={quantities[rt.id] || 1}
                  onChangeQty={(delta) => changeQty(rt.id, delta)}
                  onBook={() => handleRoomAction(rt)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <ReviewSection homestaySlug={slug} />
      </div>
    </div>
  );
}

function RoomTypeCard({ roomType, hasDateParams, nights, quantity, onChangeQty, onBook }) {
  const totalPrice = roomType.nightly_rate * nights * quantity;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-200 group">
      {/* Room image */}
      <div className="h-40 rounded-t-[32px] overflow-hidden">
        {roomType.thumbnail ? (
          <img
            src={roomType.thumbnail}
            alt={roomType.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ImagePlaceholder name={roomType.name} className="h-full w-full" size="md" />
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="font-headline text-base">{roomType.name}</CardTitle>
        {roomType.description && (
          <CardDescription className="text-xs leading-relaxed line-clamp-2">
            {roomType.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-2">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Users className="h-3.5 w-3.5" />
          <span>Tối đa {roomType.max_guests} khách</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <PriceDisplay amount={roomType.nightly_rate} className="font-semibold text-primary" />
          <span className="text-on-surface-variant text-xs">/ đêm</span>
        </div>
        {roomType.rooms && roomType.rooms.length > 0 && (
          <div className="text-xs text-on-surface-variant">
            Số lượng phòng: {roomType.rooms.length}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="w-full space-y-3">
          {hasDateParams ? (
            <>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-on-surface-variant">Số lượng phòng:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onChangeQty(-1)}
                    disabled={quantity <= 1}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-40"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center font-semibold text-on-surface">{quantity}</span>
                  <button
                    onClick={() => onChangeQty(1)}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-surface-container transition-colors"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-on-surface-variant">{nights} đêm x {quantity} phòng:</span>
                <span className="font-bold text-on-surface text-lg">
                  <PriceDisplay amount={totalPrice} />
                </span>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              Chọn ngày nhận và trả phòng ở trang chi tiết để xem mức giá và tiếp tục đặt phòng.
            </div>
          )}

          <Button onClick={onBook} className="w-full">
            Xem chi tiết phòng
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildSearchParams(checkIn, checkOut) {
  const params = new URLSearchParams();
  if (checkIn) params.set('check_in', checkIn);
  if (checkOut) params.set('check_out', checkOut);
  const str = params.toString();
  return str ? `?${str}` : '';
}
