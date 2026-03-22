import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  CalendarRange,
  Users2,
  TrendingUp,
  Wallet,
  Sparkles,
  Repeat,
  Star,
} from 'lucide-react';
import { getCustomerReports } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PriceDisplay from '../../components/common/PriceDisplay';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';

const COLORS = ['#fbd12d', '#386360', '#6e5900', '#7d4d5f', '#4e5e66'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function normalizeReport(payload) {
  return payload?.data ?? payload ?? {};
}

function SummaryStat({ icon, label, value, hint }) {
  const Icon = icon;
  Icon;

  return (
    <Card className="admin-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              {label}
            </p>
            <p className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface">
              {value}
            </p>
            {hint && <p className="mt-2 text-sm text-on-surface-variant">{hint}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomerReportsPage() {
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReport() {
    setLoading(true);
    setError('');
    try {
      const res = await getCustomerReports({ from, to });
      setReport(normalizeReport(res));
    } catch (err) {
      setError(err?.message || 'Không thể tải báo cáo khách hàng.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = report?.summary ?? {};
  const topCustomers = report?.top_customers ?? report?.topCustomers ?? [];
  const segments = useMemo(() => {
    const value = report?.segments ?? report?.segmentStats ?? [];
    return Array.isArray(value) ? value : [];
  }, [report?.segments, report?.segmentStats]);
  const timeline = report?.new_customers_timeseries ?? report?.newCustomersTimeseries ?? [];

  const chartSegments = useMemo(
    () =>
      segments
        .map((segment, index) => ({
          name: segment.name || segment.label || segment.segment || `Nhóm ${index + 1}`,
          value: Number(segment.value ?? segment.count ?? segment.total ?? 0),
        }))
        .filter((segment) => segment.value > 0),
    [segments]
  );

  const totalSegmentValue = chartSegments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="space-y-6">
      <section className="admin-card-soft overflow-hidden rounded-[30px]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.9fr] lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="admin-kicker text-primary-dim">Customer intelligence</span>
              <Badge className="admin-pill border-0 bg-white/80 text-on-surface-variant">Stitch ready</Badge>
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Báo cáo khách hàng
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
              Theo dõi tăng trưởng khách mới, nhóm khách quay lại và giá trị đặt phòng theo từng giai đoạn.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/admin/reports">
                <Button variant="outline" className="gap-2 rounded-full">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Báo cáo hệ thống
                </Button>
              </Link>
              <Button onClick={loadReport} className="gap-2 rounded-full">
                <Sparkles className="h-4 w-4" />
                Làm mới dữ liệu
              </Button>
            </div>
          </div>

          <Card className="admin-card self-start">
            <CardContent className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    Khoảng thời gian
                  </p>
                  <p className="mt-1 text-sm font-medium text-on-surface">
                    {formatDate(from)} - {formatDate(to)}
                  </p>
                </div>
                <CalendarRange className="h-5 w-5 text-primary-dim" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Card className="admin-card">
          <CardContent className="p-6">
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryStat
              icon={Users2}
              label="Tổng khách hàng"
              value={summary.total_customers ?? summary.totalCustomers ?? '—'}
              hint="Tất cả khách trong phạm vi lọc"
            />
            <SummaryStat
              icon={Repeat}
              label="Khách quay lại"
              value={summary.returning_customers ?? summary.returningCustomers ?? '—'}
              hint="Nhóm đã đặt hơn một lần"
            />
            <SummaryStat
              icon={TrendingUp}
              label="Tỷ lệ quay lại"
              value={
                summary.repeat_rate != null
                  ? `${Number(summary.repeat_rate).toFixed(1)}%`
                  : summary.repeatRate != null
                    ? `${Number(summary.repeatRate).toFixed(1)}%`
                    : '—'
              }
              hint="Hiệu quả giữ chân khách"
            />
            <SummaryStat
              icon={Wallet}
              label="Giá trị TB"
              value={summary.average_booking_value != null || summary.averageBookingValue != null ? (
                <PriceDisplay amount={summary.average_booking_value ?? summary.averageBookingValue} />
              ) : (
                '—'
              )}
              hint="Mức chi tiêu trung bình"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="admin-card">
              <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60 px-6 py-5">
                <div>
                  <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                    Khách mới theo thời gian
                  </CardTitle>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Mốc tăng trưởng trong khoảng thời gian đã chọn
                  </p>
                </div>
                <Badge className="admin-pill border-0 bg-primary-container text-on-primary-container">
                  {timeline.length} điểm dữ liệu
                </Badge>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {timeline.length ? (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d6ebf7" />
                        <XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#6e5900"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Khách mới"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    icon={Users2}
                    title="Chưa có dữ liệu khách hàng"
                    description="Hệ thống chưa ghi nhận đủ dữ liệu để tạo biểu đồ trong khoảng thời gian này."
                    className="min-h-[320px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader className="border-b border-border/60 px-6 py-5">
                <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                  Phân khúc khách
                </CardTitle>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Tỷ trọng các nhóm khách hàng chính
                </p>
              </CardHeader>
              <CardContent className="space-y-5 p-5 sm:p-6">
                {chartSegments.length ? (
                  <>
                    <div className="mx-auto h-[220px] max-w-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartSegments}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={56}
                            outerRadius={84}
                            paddingAngle={4}
                          >
                            {chartSegments.map((entry, index) => (
                              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Khách']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {chartSegments.map((segment, index) => (
                        <div key={segment.name} className="rounded-2xl border border-border/70 bg-surface-container-low px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <p className="text-sm font-semibold text-on-surface">{segment.name}</p>
                          </div>
                          <p className="mt-2 text-2xl font-extrabold tracking-tight text-on-surface">
                            {segment.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={Star}
                    title="Chưa có phân khúc"
                    description="API chưa trả dữ liệu phân khúc khách hàng."
                    className="min-h-[320px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="admin-card">
              <CardHeader className="border-b border-border/60 px-6 py-5">
                <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                  Khách hàng nổi bật
                </CardTitle>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Top khách có giá trị cao hoặc tần suất đặt phòng tốt
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {topCustomers.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr className="border-b border-border/60 text-left">
                          <th className="px-5 py-4 font-semibold text-on-surface-variant">Khách hàng</th>
                          <th className="px-5 py-4 font-semibold text-on-surface-variant">Đặt phòng</th>
                          <th className="px-5 py-4 font-semibold text-on-surface-variant">Giá trị</th>
                          <th className="px-5 py-4 font-semibold text-on-surface-variant">Gần nhất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCustomers.map((customer, index) => (
                          <tr key={customer.id ?? customer.customer_id ?? index} className="border-b border-border/50 last:border-0">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-on-surface">
                                {customer.name || customer.full_name || 'Khách hàng'}
                              </div>
                              <div className="text-xs text-on-surface-variant">
                                {customer.email || customer.phone || 'Không có thông tin liên hệ'}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant">
                              <Badge className="admin-pill border-0 bg-primary-container text-on-primary-container">
                                {customer.bookings_count ?? customer.booking_count ?? 0}
                              </Badge>
                            </td>
                            <td className="px-5 py-4 font-semibold text-on-surface">
                              <PriceDisplay amount={customer.total_spent ?? customer.lifetime_value ?? 0} />
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant">
                              {formatDate(customer.last_booking_at ?? customer.last_booking_date ?? customer.last_booking)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Sparkles}
                    title="Chưa có khách nổi bật"
                    description="Khi backend trả dữ liệu top khách hàng, bảng này sẽ tự động hiển thị."
                    className="min-h-[260px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader className="border-b border-border/60 px-6 py-5">
                <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                  Dòng khách mới
                </CardTitle>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Biểu đồ cột cho số khách mới theo mốc thời gian
                </p>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {timeline.length ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d6ebf7" />
                        <XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#fbd12d" radius={[12, 12, 0, 0]} name="Khách mới" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarRange}
                    title="Biểu đồ chưa sẵn sàng"
                    description="Dữ liệu time series hiện chưa đủ để dựng chart."
                    className="min-h-[300px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {totalSegmentValue > 0 && (
            <div className="text-xs text-on-surface-variant">
              Tổng khách trong nhóm phân khúc: <span className="font-semibold text-on-surface">{totalSegmentValue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
