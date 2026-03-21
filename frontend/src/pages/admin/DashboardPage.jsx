import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
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

function StatCard({ icon: Icon, label, value, iconColor }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full bg-surface-container ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-on-surface-variant font-body">{label}</p>
          <p className="text-2xl font-bold font-headline text-on-surface">{value}</p>
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
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

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

    setRevenueLoading(true);
    getDashboardRevenue()
      .then((res) => {
        const formatted = (res.data || []).map((item) => ({
          ...item,
          label: formatMonthLabel(item.month),
        }));
        setRevenueData(formatted);
      })
      .catch(() => setRevenueError('Không thể tải dữ liệu doanh thu.'))
      .finally(() => setRevenueLoading(false));

    setBookingsLoading(true);
    getAdminBookings(1)
      .then((res) => setRecentBookings((res.data || []).slice(0, 5)))
      .catch(() => setBookingsError('Không thể tải danh sách đặt phòng.'))
      .finally(() => setBookingsLoading(false));
  }, []);

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
            value={<PriceDisplay amount={summary?.total_revenue ?? 0} />}
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
          <CardTitle className="font-headline text-on-surface">Doanh thu 6 tháng gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <LoadingSpinner />
          ) : revenueError ? (
            <p className="text-sm text-error font-body">{revenueError}</p>
          ) : revenueData.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8 font-body">
              Chưa có dữ liệu doanh thu.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6ebf7" />
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
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#6e5900" radius={[4, 4, 0, 0]} />
              </BarChart>
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
            <p className="text-sm text-on-surface-variant text-center py-8 font-body">
              Chưa có đặt phòng nào.
            </p>
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
