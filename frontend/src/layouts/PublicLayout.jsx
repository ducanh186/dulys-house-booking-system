import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/Footer';

export default function PublicLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors pb-1 ${
      isActive(path)
        ? 'text-[#a16207] border-b-2 border-[#eab308]'
        : 'text-on-surface-variant hover:text-on-surface'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-[12px] bg-white/80 shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Duly's House" className="h-10 w-auto" />
            <span className="text-xl font-bold font-headline text-primary">Duly's House</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>Trang chủ</Link>
            <Link to="/search" className={navLinkClass('/search')}>Tìm phòng</Link>
            <Link to="/my-bookings" className={navLinkClass('/my-bookings')}>Đặt phòng của tôi</Link>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className={navLinkClass('/admin')}>Quản lý</Link>
                )}
                <span className="text-sm text-on-surface font-semibold">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-error hover:text-error-dim font-medium"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="sunlight-gradient text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
