import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } from '../api/notifications';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 172800) return 'Hôm qua';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = () => getUnreadNotificationCount().then(r => setCount(r.data?.count ?? 0)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    setLoading(true);
    getNotifications(1).then(r => setItems((r.data || []).slice(0, 10))).catch(() => {}).finally(() => setLoading(false));
  }, [open, isAuthenticated]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!isAuthenticated) return null;

  const markRead = async (n) => {
    if (n.read_at) return;
    try {
      await markNotificationRead(n.id);
      setItems(prev => prev.map(i => i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i));
      setCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setCount(0);
    } catch {}
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-surface-container transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-background shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">Thông báo</span>
            {count > 0 && <button onClick={markAll} className="text-xs text-primary hover:underline">Đọc tất cả</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-on-surface-variant">Không có thông báo mới</p>
            ) : (
              items.map(n => (
                <button key={n.id} onClick={() => markRead(n)} className={`w-full text-left px-4 py-3 hover:bg-surface-container transition-colors border-b border-border last:border-0 ${!n.read_at ? 'bg-blue-50' : ''}`}>
                  <p className={`text-sm mb-0.5 ${!n.read_at ? 'font-semibold' : ''}`}>{n.title}</p>
                  <p className="text-xs text-on-surface-variant line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">{timeAgo(n.created_at)}</p>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border px-4 py-2.5 text-center">
            <Link to="/notifications" className="text-xs text-primary hover:underline" onClick={() => setOpen(false)}>Xem tất cả</Link>
          </div>
        </div>
      )}
    </div>
  );
}
