import { useState, useEffect, useCallback, createElement } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, CalendarDays, Building2, Users } from 'lucide-react';
import { getDashboardSummary, getDashboardRevenue, getAdminBookings } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriceDisplay from '../../components/common/PriceDisplay';
import EmptyState from '../../components/common/EmptyState';

function StatCard({ icon: Icon, label, value, iconColor }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4 overflow-hidden">
        <div className={`p-3 rounded-full bg-surface-container shrink-0 ${iconColor}`}>
          {createElement(Icon, { className: 'w-6 h-6' })}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-on-surface-variant font-body">{label}</p>
          <p className="text-xl font-bold font-headline text-on-surface truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMonthLabel(month) {
  const [year, m] = month.split('-');
  return `T${parseInt(m, 10)}/${year.slice(2)}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-lowest border border-border rounded-lg p-3 shadow-md">
        <p className="text-sm font-semibold text-on-surface mb-1">{label}</p>
        <p className="text-sm text-primary font-body">
          Doanh thu: <PriceDisplay amount={payload[0].value} />
        </p>
        {payload[0].payload.count != null && (
          <p className="text-xs text-on-surface-variant font-body mt-1">
            {payload[0].payload.count} đơn đặt phòng
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PERIOD_OPTIONS = [
  { key: '1m', label: '1 tháng', months: 1 },
  { key: '3m', label: '3 tháng', months: 3 },
  { key: '6m', label: '6 tháng', months: 6 },
  { key: '12m', label: '12 tháng', months: 12 },
];

function getDateRange(months) {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [revenuePeriod, setRevenuePeriod] = useState('6m');
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);

  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  useEffect(() => {
    setSummaryLoading(true);
    getDashboardSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setSummaryError('Không thể tải dữ liệu tổng quan.'))
      .finally(() => setSummaryLoading(false));

    setBookingsLoading(true);
    getAdminBookings(1)
      .then((res) => setRecentBookings((res.data || []).slice(0, 5)))
      .catch(() => setBookingsError('Không thể tải danh sách đặt phòng.'))
      .finally(() => setBookingsLoading(false));
  }, []);

  const fetchRevenue = useCallback((periodKey) => {
    const opt = PERIOD_OPTIONS.find((o) => o.key === periodKey);
    if (!opt) return;
    setRevenueLoading(true);
    setRevenueError(null);
    getDashboardRevenue(getDateRange(opt.months))
      .then((res) => {
        const formatted = (res.data || []).map((item) => ({
          ...item,
          label: formatMonthLabel(item.month),
        }));
        setRevenueData(formatted);
      })
      .catch(() => setRevenueError('Không thể tải dữ liệu doanh thu.'))
      .finally(() => setRevenueLoading(false));
  }, []);

  useEffect(() => {
    fetchRevenue(revenuePeriod);
  }, [revenuePeriod, fetchRevenue]);

  const handlePeriodChange = (key) => {
    if (key === revenuePeriod) return;
    setRevenuePeriod(key);
  };

  const currentPeriodLabel = PERIOD_OPTIONS.find((o) => o.key === revenuePeriod)?.label || '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface">Tổng quan</h1>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Chào mừng trở lại, đây là tổng quan hệ thống hôm nay.
        </p>
      </div>

      {/* Stat Cards */}
      {summaryLoading ? (
        <LoadingSpinner />
      ) : summaryError ? (
        <p className="text-sm text-error font-body">{summaryError}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Tổng doanh thu"
            value={<PriceDisplay amount={summary?.total_revenue ?? 0} compact />}
            iconColor="text-primary"
          />
          <StatCard
            icon={CalendarDays}
            label="Tổng đặt phòng"
            value={summary?.total_bookings ?? 0}
            iconColor="text-tertiary"
          />
          <StatCard
            icon={Building2}
            label="Cơ sở đang hoạt động"
            value={summary?.total_homestays ?? 0}
            iconColor="text-secondary"
          />
          <StatCard
            icon={Users}
            label="Tổng khách hàng"
            value={summary?.total_customers ?? 0}
            iconColor="text-on-surface-variant"
          />
        </div>
      )}

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="font-headline text-on-surface">
              Doanh thu {currentPeriodLabel} gần nhất
            </CardTitle>
            <div className="flex rounded-full border border-border bg-surface-container-low p-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handlePeriodChange(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    revenuePeriod === opt.key
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="flex items-center justify-center min-h-[280px]">
              <LoadingSpinner />
            </div>
          ) : revenueError ? (
            <p className="text-sm text-error font-body">{revenueError}</p>
          ) : revenueData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Chưa có dữ liệu doanh thu"
              description="Biểu đồ sẽ xuất hiện tại đây sau khi hệ thống ghi nhận các giao dịch hoàn tất."
              className="min-h-[280px]"
            />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6e5900" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6e5900" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6ebf7" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#4e5e66' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#4e5e66' }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={(v) =>
                    v >= 1_000_000_000
                      ? `${(v / 1_000_000_000).toFixed(1)}tỷ`
                      : `${(v / 1_000_000).toFixed(0)}tr`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6e5900"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ r: 4, fill: '#6e5900', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#6e5900', strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={400}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-on-surface">Đặt phòng gần đây</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookingsLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : bookingsError ? (
            <p className="text-sm text-error p-6 font-body">{bookingsError}</p>
          ) : recentBookings.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={CalendarDays}
                title="Chưa có đặt phòng gần đây"
                description="Các đơn mới tạo sẽ được hiển thị ở đây để bạn theo dõi nhanh trạng thái và giá trị đơn."
                className="min-h-[220px]"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low">
                    <th className="text-left px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Mã đặt phòng
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Khách hàng
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Cơ sở
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Trạng thái
                    </th>
                    <th className="text-right px-6 py-3 font-semibold text-on-surface-variant font-body">
                      Tổng tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border hover:bg-surface-container transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-primary">
                        {b.booking_code}
                      </td>
                      <td className="px-6 py-4 text-on-surface font-body">
                        {b.customer?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-body">
                        {b.homestay?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-on-surface font-body">
                        <PriceDisplay amount={b.total_amount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
