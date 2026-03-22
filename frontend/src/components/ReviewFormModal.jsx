import { useState } from 'react';
import { createReview } from '../api/reviews';
import { Button } from './ui/Button';

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-3xl transition-colors ${star <= display ? 'text-yellow-400' : 'text-gray-300'}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewFormModal({ isOpen, onClose, booking, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const homestayName = booking?.details?.[0]?.room_type?.homestay?.name || 'Homestay';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { setError('Vui lòng chọn số sao.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await createReview({ booking_id: booking.id, rating, comment: comment.trim() });
      setRating(0); setComment('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Gửi đánh giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-3xl bg-background shadow-xl p-6 space-y-5">
        <div>
          <h2 className="font-headline text-lg font-bold">Viết đánh giá</h2>
          <p className="text-sm text-on-surface-variant">{homestayName}</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Đánh giá <span className="text-red-500">*</span></label>
            <StarSelector value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nhận xét</label>
            <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} disabled={submitting} placeholder="Chia sẻ trải nghiệm của bạn..." className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>Huỷ</Button>
            <Button type="submit" className="flex-1" disabled={submitting || !rating}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
