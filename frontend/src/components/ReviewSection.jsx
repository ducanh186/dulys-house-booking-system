import { useState, useEffect } from 'react';
import { getHomestayReviews } from '../api/reviews';
import LoadingSpinner from './common/LoadingSpinner';
import Pagination from './common/Pagination';

function StarDisplay({ rating }) {
  return (
    <span className="text-base">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          {s <= rating ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

export default function ReviewSection({ homestaySlug }) {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!homestaySlug) return;
    setLoading(true);
    getHomestayReviews(homestaySlug, page)
      .then((res) => { setReviews(res.data || []); setMeta(res.meta || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [homestaySlug, page]);

  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="font-headline text-xl font-bold text-on-surface">Đánh giá từ khách hàng</h2>
        {avg && !loading && (
          <div className="flex items-center gap-2">
            <StarDisplay rating={Math.round(Number(avg))} />
            <span className="text-sm font-semibold">{avg}</span>
            <span className="text-sm text-on-surface-variant">({meta?.total ?? reviews.length} đánh giá)</span>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <p className="py-10 text-center text-on-surface-variant">Chưa có đánh giá nào</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface-container-low p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{r.customer_name || 'Khách hàng'}</span>
                <StarDisplay rating={r.rating} />
              </div>
              {r.comment && <p className="text-sm text-on-surface">{r.comment}</p>}
              <p className="text-xs text-on-surface-variant">
                {new Date(r.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}
