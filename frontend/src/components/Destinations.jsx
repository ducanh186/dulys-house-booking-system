import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomestays } from '../api/homestays';
import ImagePlaceholder from './common/ImagePlaceholder';
import { optimizeImageUrl } from '../lib/utils';

// Fallback images per city keyword for visual variety
const CITY_IMAGES = {
  'hà nội': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  'đà nẵng': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVuIiSINnxHqazQcMmIcf9eWGdXKBI3OGFA9tzB7qcCODSlnRFQox6rydFWzu0-Y4EYAiXZ0vAHC3QAV-5xXom_23KX2NKm8T_uNtGjkQ-tE-5Jg9oUqJ5lfUC6-ksJZuprKPLb5tU9WRsXANVW8HPfNgsxXfTqadS4G42n-fPWLOtB3zvvdMB_v4bCWqCr8fLo57oYf5mOWjKv40z6B3j2Ez6d2LnE71JCDpPGZAEv2TReupG7Gf6VWg8yZnypecpTA7cUcWsd-k5',
  'hội an': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJH0HGlfXNjlLSeoP0Fh2_qO4cwxC0Xyu8C5NxlwYEK0MYNM1T2gyLVoK85dyZixRG3tyVp7HIRTVhMiuCJnPAJHgEwkFLGRfvrze9jtxWn8pJngGwdJjyWA7oonm5w7fF2M-edoc-bh-Fqx1ME0AyaGyvtzwObTAgqqJTtHywim_iGRtvsWx6K2cexPIZdr03WPliD67NFJdvTc6LOFrZUkBYmDNIlabSxf1hHfYVhEb6aXPrNlX1g2abx8yQ-JQSIBEn81bChC4r',
  'đà lạt': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9Z9FC2q7deWq1jEtlIaZg9H_4O6KYnpyroEfAPQqWsK2tjnuHlc4uDdP_bnmFc2H1mge1AuTHWZDrser9IpwRQoWvuYagufmvC6vOKr_h3vwSyqgrGUXOY_yXUfzNH72HnD9aiKYN4CFhunP4eUZpGBREI-zfFyx2LHpFbHgwqvfCRAufK-49oIdFFvu7W3UWOvX1taIDGSGbw5OgKOdd2lc9YX39Bh8uXvJTTf2uSX1uE0FlEhpgianpboEvOyJqws1uGHekVAo9',
  'phú quốc': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAyK8kp_ekfQnRvlC9wUXCjl2ZQmNlIyppRod32luXVDuI5zAROnOYWvP6_AxrBBl5CCgwwCTr4PIVD6QPFLtxAPxfJhMPgoJyzwUZbrxDPHHHCr8XntaHBFOYewoqB_2aSw-GCBzqr7zAg_0KUkdZ7TtHpf3c_6PDWm7UA6D3_SCnPVSXWUns18k85jXRw77zIpovuZY7u7UOYZl2SoipLrgiqwlGy6E047kmxzfZxdPZSlT-nlwrnlb_3SzTfcI9xFog1dnr1Jtm',
  'sapa': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVuIiSINnxHqazQcMmIcf9eWGdXKBI3OGFA9tzB7qcCODSlnRFQox6rydFWzu0-Y4EYAiXZ0vAHC3QAV-5xXom_23KX2NKm8T_uNtGjkQ-tE-5Jg9oUqJ5lfUC6-ksJZuprKPLb5tU9WRsXANVW8HPfNgsxXfTqadS4G42n-fPWLOtB3zvvdMB_v4bCWqCr8fLo57oYf5mOWjKv40z6B3j2Ez6d2LnE71JCDpPGZAEv2TReupG7Gf6VWg8yZnypecpTA7cUcWsd-k5',
};

function getDestinationLabel(homestay) {
  const parts = (homestay.address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[0] || homestay.name?.replace(/^Duly's House\s*/i, '') || homestay.name;
}

function getDestinationSubtitle(address) {
  const parts = (address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts.slice(1).join(', ') : address;
}

function getCityImage(address) {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const [city, url] of Object.entries(CITY_IMAGES)) {
    if (lower.includes(city)) return url;
  }
  return null;
}

export function Destinations() {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await getHomestays(1);
        setHomestays(res.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-12">Điểm đến phổ biến</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] animate-pulse">
                <div className="h-96 rounded-[48px] bg-surface-container" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (homestays.length === 0) return null;

  return (
    <section className="py-24 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-12">Điểm đến phổ biến</h2>
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4">
          {homestays.map((h) => {
            const destinationName = getDestinationLabel(h);
            const destinationSubtitle = getDestinationSubtitle(h.address);
            const cityImage = h.thumbnail || getCityImage(h.address);

            return (
              <Link key={h.id} to={`/homestays/${h.slug}`} className="min-w-[280px] group">
                <div className="relative h-96 rounded-[48px] overflow-hidden">
                  {cityImage ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={h.name}
                      src={optimizeImageUrl(cityImage, 720)}
                      loading="lazy"
                      decoding="async"
                      sizes="280px"
                    />
                  ) : (
                    <ImagePlaceholder className="w-full h-full" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <h4 className="font-headline text-[24px] font-extrabold leading-tight text-white drop-shadow-sm">
                      {destinationName}
                    </h4>
                    {destinationSubtitle && (
                      <p className="mt-1 line-clamp-1 font-body text-sm font-semibold text-white/95 drop-shadow-sm">
                        {destinationSubtitle}
                      </p>
                    )}
                    <p className="mt-2 font-body text-sm font-bold text-white">
                      {h.room_types_count || 0} loại phòng
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
