import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/Footer';
import NotificationBell from '../components/NotificationBell';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { isElevatedRole } from '../contexts/AuthContext';

const PROFILE_PATH = '/my-profile';
const BOOKINGS_PATH = '/my-profile/bookings';
const NOTIFICATIONS_PATH = '/notifications';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function AccountMenu({ user, onLogout, onClose }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    onClose?.();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-border bg-white px-2.5 py-1.5 shadow-sm transition-colors hover:bg-surface-container-low"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full sunlight-gradient text-sm font-bold text-white">
          {getInitials(user?.name)}
        </span>
        <span className="hidden xl:block max-w-40 truncate text-sm font-semibold text-on-surface">
          {user?.name || 'Tài khoản'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-3xl border border-border bg-background shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-on-surface">{user?.name || 'Tài khoản khách'}</p>
            <p className="text-xs text-on-surface-variant">Quản lý hồ sơ và đặt phòng</p>
          </div>
          <div className="p-2">
            <Link to={PROFILE_PATH} onClick={closeMenu} className="block rounded-2xl px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
              Hồ sơ của tôi
            </Link>
            <Link to={BOOKINGS_PATH} onClick={closeMenu} className="block rounded-2xl px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
              Lịch sử đặt phòng
            </Link>
            <Link to={NOTIFICATIONS_PATH} onClick={closeMenu} className="block rounded-2xl px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
              Thông báo
            </Link>
            <button
              type="button"
              onClick={async () => {
                closeMenu();
                await onLogout();
              }}
              className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-error transition-colors hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicLayout() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isElevatedRole(user?.role) && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

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

  const mobileNavLinkClass = (path) =>
    `block px-4 py-3 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-[#a16207] bg-yellow-50'
        : 'text-on-surface-variant hover:bg-surface-container'
    }`;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  const navLinks = (
    <>
      <Link to="/" className={navLinkClass('/')} onClick={() => setMenuOpen(false)}>Trang chủ</Link>
      <Link to="/search" className={navLinkClass('/search')} onClick={() => setMenuOpen(false)}>Tìm phòng</Link>
      <Link to={PROFILE_PATH} className={navLinkClass(PROFILE_PATH)} onClick={() => setMenuOpen(false)}>Hồ sơ của tôi</Link>
      {isAuthenticated ? (
        <>
          <NotificationBell />
          <AccountMenu user={user} onLogout={handleLogout} onClose={() => setMenuOpen(false)} />
        </>
      ) : (
        <Link to="/login" className="sunlight-gradient text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-[12px] bg-white/80 shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Duly's House" className="h-8 md:h-10 w-auto" />
            <span className="text-lg md:text-xl font-bold font-headline text-primary">Duly's House</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks}
          </nav>

          <div className="md:hidden" />

          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
            <span className={`block w-5 h-0.5 bg-on-surface transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-on-surface transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-on-surface transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <Link to="/" className={mobileNavLinkClass('/')} onClick={() => setMenuOpen(false)}>Trang chủ</Link>
            <Link to="/search" className={mobileNavLinkClass('/search')} onClick={() => setMenuOpen(false)}>Tìm phòng</Link>
            {isAuthenticated ? (
              <>
                <div className="border-t border-border px-4 py-3">
                  <p className="text-sm font-semibold text-on-surface truncate">{user?.name || 'Tài khoản khách'}</p>
                  <p className="text-xs text-on-surface-variant">Quản lý hồ sơ và đặt phòng của bạn</p>
                </div>
                <Link to={PROFILE_PATH} className={mobileNavLinkClass(PROFILE_PATH)} onClick={() => setMenuOpen(false)}>Hồ sơ của tôi</Link>
                <Link to={BOOKINGS_PATH} className={mobileNavLinkClass(BOOKINGS_PATH)} onClick={() => setMenuOpen(false)}>Lịch sử đặt phòng</Link>
                <Link to={NOTIFICATIONS_PATH} className={mobileNavLinkClass(NOTIFICATIONS_PATH)} onClick={() => setMenuOpen(false)}>Thông báo</Link>
                <button onClick={handleLogout} className="block w-full px-4 py-3 text-left text-sm font-medium text-error transition-colors hover:bg-red-50">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to={PROFILE_PATH} className={mobileNavLinkClass(PROFILE_PATH)} onClick={() => setMenuOpen(false)}>Hồ sơ của tôi</Link>
                <Link to="/login" className={mobileNavLinkClass('/login')} onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
