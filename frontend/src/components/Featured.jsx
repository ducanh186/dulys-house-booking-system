import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomestays } from '../api/homestays';
import PriceDisplay from './common/PriceDisplay';
import ImagePlaceholder from './common/ImagePlaceholder';

export function Featured() {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await getHomestays(1);
        setHomestays((res.data || []).slice(0, 3));
      } catch {
        // silently fail — section just won't show
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="bg-surface-container-low py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-4">Homestay nổi bật</h2>
              <p className="text-on-surface-variant font-body">Những cơ sở lưu trú được tuyển chọn với dịch vụ xuất sắc.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-[32px] bg-surface-container mb-4" />
                <div className="h-5 bg-surface-container rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface-container rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (homestays.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-4">Homestay nổi bật</h2>
            <p className="text-on-surface-variant font-body">Những cơ sở lưu trú được tuyển chọn với dịch vụ xuất sắc.</p>
          </div>
          <Link to="/search" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all font-body">
            Xem tất cả <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homestays.map((h) => (
            <Link key={h.id} to={`/homestays/${h.slug}`} className="group">
              <div className="aspect-[4/3] rounded-[32px] overflow-hidden mb-4 relative">
                {h.thumbnail ? (
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={h.name}
                    src={h.thumbnail}
                  />
                ) : (
                  <ImagePlaceholder className="w-full h-full" />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary">
                  NỔI BẬT
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline font-bold text-[20px] mb-1">{h.name}</h3>
                  <p className="text-on-surface-variant text-sm font-body mb-2">{h.address}</p>
                  {h.average_rating && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-sm">{h.average_rating}</span>
                      <span className="text-outline text-sm">({h.reviews_count} đánh giá)</span>
                    </div>
                  )}
                </div>
                {h.min_price && (
                  <div className="text-right">
                    <p className="text-[20px] font-bold text-primary">
                      <PriceDisplay amount={h.min_price} />
                    </p>
                    <p className="text-[10px] text-outline uppercase font-bold">/ đêm</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
