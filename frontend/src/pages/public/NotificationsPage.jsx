import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications';
import { useAuth } from '../../hooks/useAuth';
import { getNotificationTarget } from '../../lib/notificationRouting';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { Button } from '../../components/ui/Button';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 172800) return 'Hôm qua';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getNotifications(page);
        if (active) {
          setNotifications(response.data || []);
          setMeta(response.meta || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [page]);

  const markRead = async (n) => {
    try {
      await markNotificationRead(n.id);
      setNotifications(prev => prev.map(i => i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i));
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read_at) {
      await markRead(n);
    }
    const target = getNotificationTarget(n, user?.role);
    if (target) navigate(target);
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold">Thông báo</h1>
        {notifications.some(n => !n.read_at) && !loading && (
          <Button variant="outline" size="sm" onClick={markAll}>Đánh dấu tất cả đã đọc</Button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <p className="py-20 text-center text-on-surface-variant">Không có thông báo nào</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button key={n.id} onClick={() => handleNotificationClick(n)} className={`w-full text-left rounded-2xl border border-border px-5 py-4 transition-colors hover:bg-surface-container ${!n.read_at ? 'bg-blue-50 border-blue-100' : 'bg-background'}`}>
              <div className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm mb-1 ${!n.read_at ? 'font-semibold' : ''}`}>{n.title}</p>
                  {n.message && <p className="text-xs text-on-surface-variant">{n.message}</p>}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{timeAgo(n.created_at)}</span>
                  {!n.read_at && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
              </div>
            </button>
          ))}
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
