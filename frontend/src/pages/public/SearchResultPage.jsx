import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Users, Calendar, MapPin, BedDouble, AlertCircle } from 'lucide-react';
import { searchAvailability, getHomestays } from '../../api/homestays';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PriceDisplay from '../../components/common/PriceDisplay';
import { cn } from '../../lib/utils';

export default function SearchResultPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(checkIn && checkOut ? 'search' : 'listing');

  useEffect(() => {
    if (checkIn && checkOut) {
      fetchAvailability();
    } else {
      fetchAllHomestays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function groupByHomestay(flatResults) {
    const nights = calculateNights(checkIn, checkOut);
    const grouped = {};
    flatResults.forEach((item) => {
      const homestayId = item.homestay.id;
      if (!grouped[homestayId]) {
        grouped[homestayId] = {
          homestay: item.homestay,
          available_room_types: [],
        };
      }
      grouped[homestayId].available_room_types.push({
        ...item.room_type,
        available_count: item.available_count,
        nightly_rate: item.nightly_rate,
        max_guests: item.max_guests,
        nights,
        total_price: item.nightly_rate * nights,
      });
    });
    return Object.values(grouped);
  }

  async function fetchAvailability() {
    setLoading(true);
    setError(null);
    setMode('search');
    try {
      const res = await searchAvailability({
        check_in: checkIn,
        check_out: checkOut,
        ...(guests ? { guests: Number(guests) } : {}),
      });
      setResults(groupByHomestay(res.data || []));
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllHomestays() {
    setLoading(true);
    setError(null);
    setMode('listing');
    try {
      const res = await getHomestays();
      setResults(res.data || []);
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tải danh sách. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      fetchAllHomestays();
      return;
    }
    const params = { check_in: checkIn, check_out: checkOut };
    if (guests) params.guests = guests;
    setSearchParams(params);
    fetchAvailability();
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar */}
      <div className="bg-surface-container-low border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="font-headline text-2xl font-bold text-on-surface mb-4">
            Tìm phòng lưu trú
          </h1>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-on-surface-variant">Ngày nhận phòng</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-on-surface-variant">Ngày trả phòng</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-32">
              <label className="text-xs font-medium text-on-surface-variant">Số khách</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                <Input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="1"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <Button type="submit" className="gap-2 h-10">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && <LoadingSpinner />}

        {!loading && error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-20">
            <BedDouble className="mx-auto h-12 w-12 text-on-surface-variant mb-4" />
            <p className="font-headline text-lg font-semibold text-on-surface">
              {mode === 'search' ? 'Không tìm thấy phòng trống trong khoảng thời gian này' : 'Chưa có homestay nào'}
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              {mode === 'search' ? 'Thử thay đổi ngày hoặc số lượng khách.' : 'Vui lòng quay lại sau.'}
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-8">
            {mode === 'search' ? (
              <>
                <p className="text-sm text-on-surface-variant">
                  Tìm thấy <span className="font-semibold text-on-surface">{results.length}</span> homestay có phòng trống
                </p>
                {results.map((item) => (
                  <SearchResultGroup
                    key={item.homestay.id}
                    homestay={item.homestay}
                    availableRoomTypes={item.available_room_types}
                    checkIn={checkIn}
                    checkOut={checkOut}
                  />
                ))}
              </>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">{results.length}</span> homestay đang hoạt động
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((homestay) => (
                    <HomestayCard key={homestay.id} homestay={homestay} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultGroup({ homestay, availableRoomTypes, checkIn, checkOut }) {
  return (
    <div className="rounded-[32px] border border-border bg-white shadow-sm overflow-hidden">
      {/* Homestay header */}
      <div className="flex items-start gap-4 p-5 border-b border-border bg-surface-container-low">
        <div className="h-16 w-16 rounded-lg bg-surface-container-highest shrink-0 overflow-hidden">
          {homestay.thumbnail ? (
            <img src={homestay.thumbnail} alt={homestay.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <BedDouble className="h-7 w-7 text-on-surface-variant" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-headline text-lg font-bold text-on-surface leading-tight">{homestay.name}</h2>
          <div className="flex items-center gap-1 mt-1 text-sm text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{homestay.address}</span>
          </div>
        </div>
        <Link
          to={`/homestays/${homestay.slug}?check_in=${checkIn}&check_out=${checkOut}`}
          className="shrink-0"
        >
          <Button variant="outline" size="sm">Xem chi tiết</Button>
        </Link>
      </div>

      {/* Room types */}
      <div className="divide-y divide-border">
        {availableRoomTypes.map((rt) => (
          <div key={rt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-on-surface">{rt.name}</span>
                <Badge variant="secondary">
                  Còn {rt.available_count} phòng
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Tối đa {rt.max_guests} khách
                </span>
                <span>
                  <PriceDisplay amount={rt.nightly_rate} className="font-medium text-primary" />
                  <span className="text-xs"> / đêm</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:text-right shrink-0">
              <div>
                <p className="text-xs text-on-surface-variant">{rt.nights} đêm</p>
                <p className="font-bold text-on-surface text-lg">
                  <PriceDisplay amount={rt.total_price} />
                </p>
              </div>
              <Link to={`/homestays/${homestay.slug}?check_in=${checkIn}&check_out=${checkOut}`}>
                <Button size="sm">Xem chi tiết</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomestayCard({ homestay }) {
  return (
    <Link to={`/homestays/${homestay.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <div className="h-44 bg-surface-container-highest rounded-t-[32px] overflow-hidden">
          {homestay.thumbnail ? (
            <img src={homestay.thumbnail} alt={homestay.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <BedDouble className="h-10 w-10 text-on-surface-variant" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="font-headline text-base">{homestay.name}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3 shrink-0" />
            {homestay.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge
            className={cn(
              homestay.is_active
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            )}
          >
            {homestay.is_active ? 'Đang hoạt động' : 'Tạm đóng'}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}
