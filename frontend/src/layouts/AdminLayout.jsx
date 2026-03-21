import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/bookings', label: 'Đặt phòng' },
  { to: '/admin/homestays', label: 'Cơ sở' },
  { to: '/admin/rooms', label: 'Phòng' },
  { to: '/admin/customers', label: 'Khách hàng' },
  { to: '/admin/payments', label: 'Thanh toán' },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-56 bg-surface-container-lowest border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="Duly's House" className="h-8 w-auto" />
            <span className="text-lg font-bold font-headline text-primary">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-4 py-2 text-sm ${
                location.pathname === item.to
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-on-surface-variant hover:bg-accent/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link to="/" className="text-sm text-outline hover:text-on-surface">← Về trang chính</Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-surface-container-lowest border-b border-border px-6 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold font-headline text-on-surface">Quản lý Duly's House</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-variant">{user?.name}</span>
            <button onClick={logout} className="text-sm text-error hover:text-error-dim">Đăng xuất</button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
