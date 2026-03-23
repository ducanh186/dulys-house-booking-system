import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarRange,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Menu,
  MessageSquare,
  PanelLeftClose,
  Search,
  Sparkles,
  Users2,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from '../components/NotificationBell';

const navGroups = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { to: '/admin/bookings', label: 'Đặt phòng', description: 'Xử lý đơn đặt phòng', icon: ClipboardList },
      { to: '/admin/availability', label: 'Lịch phòng', description: 'Kiểm soát tình trạng phòng', icon: CalendarRange },
      { to: '/admin/homestays', label: 'Cơ sở', description: 'Quản lý homestay', icon: Building2 },
      { to: '/admin/rooms', label: 'Phòng', description: 'Danh sách phòng', icon: Search },
      { to: '/admin/payments', label: 'Thanh toán', description: 'Giao dịch và đối soát', icon: CreditCard },
    ],
  },
  {
    label: 'Dữ liệu',
    items: [
      { to: '/admin/customers', label: 'Khách hàng', description: 'Lịch sử và hồ sơ', icon: Users2 },
      { to: '/admin/reports', label: 'Báo cáo hệ thống', description: 'Doanh thu và vận hành', icon: BarChart3 },
      { to: '/admin/reports/customers', label: 'Báo cáo khách hàng', description: 'Hành vi và phân khúc', icon: MessageSquare },
    ],
  },
];

function isActivePath(pathname, target) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

function getActiveItem(pathname) {
  for (const group of navGroups) {
    const match = group.items.find((item) => isActivePath(pathname, item.to));
    if (match) return match;
  }
  return navGroups[0].items[0];
}

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const activeItem = useMemo(() => getActiveItem(location.pathname), [location.pathname]);
  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'owner' ? 'Owner' : user?.role === 'staff' ? 'Staff' : 'Operator';

  return (
    <div className="flex min-h-screen admin-shell-bg text-on-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/70 admin-glass overflow-hidden transition-[width,transform] duration-200 ease-out will-change-[width,transform] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-80'
        } w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-b border-border/70 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-3 min-w-0" onClick={() => setSidebarOpen(false)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sunlight-gradient text-white shadow-lg shadow-[#fbd12d]/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className={`min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${collapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                <p className="admin-kicker text-primary-dim">Control Center</p>
                <h1 className="font-headline text-lg font-extrabold tracking-tight text-on-surface">
                  Duly's House
                </h1>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="ml-auto rounded-full border border-border bg-white/80 p-2 text-on-surface-variant transition hover:bg-white lg:hidden"
              aria-label="Đóng sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className={`overflow-hidden transition-[max-height,opacity] duration-200 ${collapsed ? 'lg:max-h-0 lg:opacity-0' : 'max-h-40 opacity-100'}`}>
            <div className="mt-4 rounded-2xl border border-border/70 bg-white/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                    Phiên đăng nhập
                  </p>
                  <p className="mt-0.5 font-headline text-sm font-semibold text-on-surface truncate">
                    {user?.name || 'Quản trị viên'}
                  </p>
                </div>
                <div className="rounded-full bg-primary-container px-2.5 py-1 text-[10px] font-bold text-on-primary-container shrink-0">
                  {roleLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4">
          {navGroups.map((group) => (
            <section key={group.label} className="space-y-1">
              <div className={`px-3 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${collapsed ? 'lg:opacity-0 lg:h-0 lg:mb-0' : 'opacity-100 mb-1'}`}>
                <p className="admin-kicker text-on-surface-variant">{group.label}</p>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(location.pathname, item.to);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`admin-nav-link flex items-center gap-3 py-2.5 ${
                        collapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3'
                      } ${
                        active ? 'admin-nav-link-active text-on-surface' : 'text-on-surface-variant hover:bg-white/70 hover:text-on-surface'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                          active
                            ? 'border-transparent bg-primary-container text-on-primary-container'
                            : 'border-border bg-surface-container-low text-on-surface-variant'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${collapsed ? 'lg:opacity-0 lg:w-0 lg:flex-none' : 'opacity-100'}`}>
                        <span className="block text-sm font-semibold tracking-tight">{item.label}</span>
                        {item.description && (
                          <span className="block text-[11px] font-medium text-on-surface-variant">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {active && (
                        <ChevronRight className={`h-4 w-4 shrink-0 text-primary-dim transition-opacity duration-150 ${collapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-border/70 p-3 space-y-1">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={`hidden lg:flex w-full items-center rounded-2xl py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface hover:bg-white/70 ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            <PanelLeftClose className={`h-4 w-4 shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
            <span className={`ml-2 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'}`}>
              Thu gọn
            </span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-full border border-border bg-white/90 p-2 text-on-surface-variant transition hover:bg-white lg:hidden"
                aria-label="Mở sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="admin-kicker text-primary-dim">Admin Shell</p>
                <h2 className="truncate font-headline text-lg font-extrabold tracking-tight text-on-surface sm:text-2xl">
                  {activeItem?.label || 'Dashboard'}
                </h2>
                {activeItem?.description && (
                  <p className="truncate text-sm text-on-surface-variant">
                    {activeItem.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-white/85 px-4 py-2 text-sm text-on-surface-variant md:flex">
                <Wallet className="h-4 w-4 text-primary-dim" />
                {user?.name || 'Admin'}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-border bg-white/85 px-4 py-2 text-sm font-semibold text-error transition hover:bg-red-50"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto flex min-h-full w-full max-w-[1600px] flex-col gap-6">
            <div className="admin-grid-bg rounded-[28px] border border-border/60 bg-white/40 p-4 sm:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
