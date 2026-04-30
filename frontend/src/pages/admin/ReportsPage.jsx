import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
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
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  HandCoins,
  PieChart as PieChartIcon,
  Printer,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  getRevenueByHomestay,
  getOccupancyReport,
  getOccupancyDetailReport,
  getCancellationReport,
  getAdminHomestays,
} from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const TABS = [
  { key: 'revenue', label: 'Doanh thu', icon: CircleDollarSign },
  { key: 'occupancy', label: 'Công suất', icon: BarChart3 },
  { key: 'cancellations', label: 'Hủy phòng', icon: ShieldAlert },
];

const COLORS = ['#fbd12d', '#386360', '#6e5900', '#7d4d5f', '#4e5e66'];

function normalizeCollection(response) {
  const payload = response?.data ?? response ?? {};
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMonthLabel(month) {
  const [year, m] = month.split('-');
  return `T${Number(m)}/${year.slice(2)}`;
}

function formatNumber(value, digits = 1) {
  return Number(value || 0).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function cleanupOccupancyPrintMode() {
  if (typeof document === 'undefined') return;
  document.body.classList.remove('printing-occupancy-report');
}

function scheduleOccupancyPrint() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  document.body.classList.add('printing-occupancy-report');
  window.addEventListener('afterprint', cleanupOccupancyPrintMode, { once: true });

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(cleanupOccupancyPrintMode, 300);
    });
  });
}

function SummaryCard({ icon, label, value, hint }) {
  const Icon = icon;
  Icon;

  return (
    <Card className="admin-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
            <p className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface">{value}</p>
            {hint && <p className="mt-2 text-sm text-on-surface-variant">{hint}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState('revenue');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [homestayId, setHomestayId] = useState('');
  const [homestays, setHomestays] = useState([]);
  const [printReport, setPrintReport] = useState(null);
  const [printing, setPrinting] = useState(false);

  async function loadHomestays() {
    if (homestays.length) return homestays;
    const response = await getAdminHomestays(1);
    const list = normalizeCollection(response);
    setHomestays(list);
    return list;
  }

  async function loadReport() {
    setLoading(true);
    setError('');
    try {
      let response;
      if (tab === 'revenue') {
        response = await getRevenueByHomestay({ from, to });
      } else if (tab === 'occupancy') {
        response = await getOccupancyReport({ from, to, homestay_id: homestayId || undefined });
      } else {
        response = await getCancellationReport({ from, to });
      }

      setData(response?.data ?? response ?? null);
    } catch {
      setError('Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePrintOccupancy() {
    setPrinting(true);
    setError('');
    try {
      const response = await getOccupancyDetailReport({ from, to, homestay_id: homestayId || undefined });
      setPrintReport(response?.data ?? response ?? null);
      scheduleOccupancyPrint();
    } catch {
      setError('Không thể tải dữ liệu in báo cáo.');
    } finally {
      setPrinting(false);
    }
  }

  useEffect(() => cleanupOccupancyPrintMode, []);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const normalizedRevenue = useMemo(() => {
    const value = tab === 'revenue' ? data : [];
    return Array.isArray(value) ? value : [];
  }, [tab, data]);

  const normalizedOccupancy = useMemo(() => {
    const value = tab === 'occupancy' ? data : [];
    return Array.isArray(value) ? value : [];
  }, [tab, data]);

  const cancellation = useMemo(() => {
    return tab === 'cancellations' && data ? data : null;
  }, [tab, data]);

  const revenueSummary = useMemo(() => {
    const totalRevenue = normalizedRevenue.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
    const bookingCount = normalizedRevenue.reduce((sum, item) => sum + Number(item.booking_count || 0), 0);
    const avgValue = bookingCount > 0 ? totalRevenue / bookingCount : 0;
    return { totalRevenue, bookingCount, avgValue };
  }, [normalizedRevenue]);

  const occupancySummary = useMemo(() => {
    if (!normalizedOccupancy.length) return { average: 0, peak: 0, trough: 0 };
    const values = normalizedOccupancy.map((item) => Number(item.occupancy || 0));
    return {
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
      peak: Math.max(...values),
      trough: Math.min(...values),
    };
  }, [normalizedOccupancy]);

  const cancellationData = useMemo(() => {
    if (!cancellation) return [];
    return [
      { name: 'Hoàn thành', value: Math.max(0, Number(cancellation.total_bookings || 0) - Number(cancellation.cancelled_count || 0)) },
      { name: 'Đã huỷ', value: Number(cancellation.cancelled_count || 0) },
    ].filter((item) => item.value > 0);
  }, [cancellation]);

  return (
    <>
      <div className="space-y-6 print:hidden">
      <section className="admin-card-soft overflow-hidden rounded-[30px]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="admin-kicker text-primary-dim">System reports</span>
              <Sparkles className="h-4 w-4 text-primary-dim" />
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Báo cáo hệ thống
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
              Chuyển đổi giữa doanh thu, công suất và hủy phòng trong một luồng phân tích thống nhất.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/admin/reports/customers">
                <Button variant="outline" className="gap-2 rounded-full">
                  Báo cáo khách hàng
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button onClick={loadReport} className="gap-2 rounded-full">
                <Sparkles className="h-4 w-4" />
                Làm mới dữ liệu
              </Button>
              {tab === 'occupancy' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrintOccupancy}
                  disabled={printing}
                  className="gap-2 rounded-full"
                >
                  <Printer className="h-4 w-4" />
                  {printing ? 'Đang chuẩn bị...' : 'In báo cáo'}
                </Button>
              )}
            </div>
          </div>

          <Card className="admin-card self-start">
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
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
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
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

              {tab === 'occupancy' && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    Cơ sở
                  </label>
                  <select
                    value={homestayId}
                    onChange={(e) => setHomestayId(e.target.value)}
                    onFocus={loadHomestays}
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="">Tất cả cơ sở</option>
                    {homestays.map((homestay) => (
                      <option key={homestay.id} value={homestay.id}>
                        {homestay.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Khoảng thời gian
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">
                  {formatDate(from)} - {formatDate(to)}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {TABS.find((item) => item.key === tab)?.label}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-[28px] border border-border/60 bg-white/80 p-2 shadow-sm backdrop-blur-xl">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTab(item.key);
                setData(null);
              }}
              className={`flex min-w-[150px] flex-1 items-center justify-center gap-2 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Card className="admin-card">
          <CardContent className="p-6">
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {tab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard icon={HandCoins} label="Tổng doanh thu" value={formatCurrency(revenueSummary.totalRevenue)} hint="Tổng tiền thanh toán thành công" />
                <SummaryCard icon={CalendarDays} label="Tổng đơn" value={revenueSummary.bookingCount} hint="Đơn trong khoảng thời gian" />
                <SummaryCard icon={TrendingUp} label="Giá trị TB" value={formatCurrency(revenueSummary.avgValue)} hint="Mức chi tiêu mỗi đơn" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="admin-card">
                  <CardHeader className="border-b border-border/60 px-6 py-5">
                    <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                      Doanh thu theo cơ sở
                    </CardTitle>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {formatMonthLabel(from.slice(0, 7))} - {formatMonthLabel(to.slice(0, 7))}
                    </p>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    {normalizedRevenue.length ? (
                      <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={normalizedRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d6ebf7" />
                            <XAxis dataKey="homestay_name" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}tr`} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                            <Bar dataKey="total_revenue" fill="#6e5900" radius={[12, 12, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <EmptyState
                        icon={CircleDollarSign}
                        title="Chưa có dữ liệu doanh thu"
                        description="Khoảng thời gian này chưa có dữ liệu thanh toán để tổng hợp."
                        className="min-h-[320px]"
                      />
                    )}
                  </CardContent>
                </Card>

                <Card className="admin-card">
                  <CardHeader className="border-b border-border/60 px-6 py-5">
                    <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                      Bảng tóm tắt
                    </CardTitle>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Các homestay có doanh thu trong kỳ
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {normalizedRevenue.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-surface-container-low">
                            <tr className="border-b border-border/60 text-left">
                              <th className="px-5 py-4 font-semibold text-on-surface-variant">Cơ sở</th>
                              <th className="px-5 py-4 font-semibold text-on-surface-variant">Đơn</th>
                              <th className="px-5 py-4 font-semibold text-on-surface-variant">Doanh thu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {normalizedRevenue.map((item) => (
                              <tr key={item.homestay_id} className="border-b border-border/50 last:border-0">
                                <td className="px-5 py-4 font-semibold text-on-surface">{item.homestay_name}</td>
                                <td className="px-5 py-4 text-on-surface-variant">{item.booking_count}</td>
                                <td className="px-5 py-4 font-semibold text-on-surface">
                                  {formatCurrency(item.total_revenue)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState
                        icon={Sparkles}
                        title="Chưa có bảng doanh thu"
                        description="Dữ liệu bảng sẽ xuất hiện khi API trả về doanh thu theo cơ sở."
                        className="min-h-[320px]"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {tab === 'occupancy' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard icon={BarChart3} label="Công suất TB" value={`${occupancySummary.average.toFixed(1)}%`} hint="Trung bình trong kỳ" />
                <SummaryCard icon={TrendingUp} label="Đỉnh công suất" value={`${occupancySummary.peak.toFixed(1)}%`} hint="Ngày cao nhất" />
                <SummaryCard icon={CalendarDays} label="Thấp nhất" value={`${occupancySummary.trough.toFixed(1)}%`} hint="Ngày thấp nhất" />
              </div>

              <Card className="admin-card">
                <CardHeader className="border-b border-border/60 px-6 py-5">
                  <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                    Công suất theo ngày
                  </CardTitle>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Theo cơ sở và giai đoạn đã chọn
                  </p>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  {normalizedOccupancy.length ? (
                    <div className="h-[340px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={normalizedOccupancy}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d6ebf7" />
                          <XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Công suất']} />
                          <Line
                            type="monotone"
                            dataKey="occupancy"
                            stroke="#386360"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState
                      icon={BarChart3}
                      title="Chưa có dữ liệu công suất"
                      description="API occupancy sẽ trả mốc công suất theo ngày tại đây."
                      className="min-h-[340px]"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {tab === 'cancellations' && cancellation && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard icon={CalendarDays} label="Tổng đơn" value={cancellation.total_bookings ?? 0} hint="Trong phạm vi lọc" />
                <SummaryCard icon={ShieldAlert} label="Đã hủy" value={cancellation.cancelled_count ?? 0} hint="Số đơn bị hủy" />
                <SummaryCard icon={TrendingUp} label="Tỷ lệ hủy" value={`${Number(cancellation.cancellation_rate || 0).toFixed(1)}%`} hint="Tỷ trọng hủy" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card className="admin-card">
                  <CardHeader className="border-b border-border/60 px-6 py-5">
                    <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                      Tỷ lệ hủy
                    </CardTitle>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Phân bổ đơn hoàn thành và đơn hủy
                    </p>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    {cancellationData.length ? (
                      <div className="mx-auto h-[280px] max-w-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={cancellationData} dataKey="value" innerRadius={60} outerRadius={92} paddingAngle={5}>
                              <Cell fill="#386360" />
                              <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <EmptyState
                        icon={PieChartIcon}
                        title="Không có dữ liệu hủy"
                        description="Khi backend trả dữ liệu, biểu đồ tròn sẽ xuất hiện tại đây."
                        className="min-h-[280px]"
                      />
                    )}
                  </CardContent>
                </Card>

                <Card className="admin-card">
                  <CardHeader className="border-b border-border/60 px-6 py-5">
                    <CardTitle className="font-headline text-lg font-extrabold text-on-surface">
                      Hủy gần đây
                    </CardTitle>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Danh sách hủy mới nhất trong khoảng lọc
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {cancellation.recent_cancellations?.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-surface-container-low">
                            <tr className="border-b border-border/60 text-left">
                              <th className="px-5 py-4 font-semibold text-on-surface-variant">Mã</th>
                              <th className="px-5 py-4 font-semibold text-on-surface-variant">Khách</th>
                              <th className="px-5 py-4 font-semibold text-on-surface-variant">Tiền</th>
                              <th className="px-5 py-4 font-semibold text-on-surface-variant">Ngày</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cancellation.recent_cancellations.map((item) => (
                              <tr key={item.booking_code} className="border-b border-border/50 last:border-0">
                                <td className="px-5 py-4 font-mono font-semibold text-primary-dim">{item.booking_code}</td>
                                <td className="px-5 py-4 text-on-surface">{item.customer_name}</td>
                                <td className="px-5 py-4 font-semibold text-on-surface">{formatCurrency(item.total_amount)}</td>
                                <td className="px-5 py-4 text-on-surface-variant">{formatDate(item.cancelled_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState
                        icon={ShieldAlert}
                        title="Chưa có hủy gần đây"
                        description="Danh sách hủy sẽ xuất hiện khi có dữ liệu trong khoảng thời gian được chọn."
                        className="min-h-[280px]"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
      </div>
      <OccupancyPrintReport report={printReport} from={from} to={to} />
    </>
  );
}

function OccupancyPrintReport({ report, from, to }) {
  const rows = report?.rows ?? [];
  const summary = report?.summary ?? {};
  const printedAt = new Date().toLocaleString('vi-VN');

  if (!report) {
    return null;
  }

  return createPortal(
    <section className="occupancy-print-report hidden bg-white text-black" aria-hidden="true">
      <div className="occupancy-print-page mx-auto max-w-[980px] px-6 py-6 font-sans text-[12px]">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Duly's House Manager</p>
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-800">Báo cáo hiệu suất phòng</h1>
        </div>

        <div className="mt-4 flex items-center justify-between border-b border-slate-300 pb-3 text-[11px] text-slate-600">
          <span>Kỳ báo cáo: {formatDate(from)} - {formatDate(to)}</span>
          <span>Xuất lúc: {printedAt}</span>
        </div>

        <h2 className="mt-6 text-sm font-bold uppercase underline">Bảng chi tiết công suất phòng</h2>
        <table className="mt-3 w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-y border-slate-400 text-left">
              <th className="py-2 pr-2">STT</th>
              <th className="py-2 pr-2">Cơ sở</th>
              <th className="py-2 pr-2">Phòng / Loại phòng</th>
              <th className="py-2 pr-2 text-right">Số ngày sử dụng</th>
              <th className="py-2 pr-2 text-right">Tổng số ngày</th>
              <th className="py-2 pr-2 text-right">Công suất (%)</th>
              <th className="py-2 pr-2 text-right">Số lượt đặt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.room_id} className="border-b border-slate-300 align-top">
                <td className="py-2 pr-2">{index + 1}</td>
                <td className="py-2 pr-2">{row.homestay_name}</td>
                <td className="py-2 pr-2">
                  <span className="font-semibold">{row.room_code}</span>
                  <span className="text-slate-500"> ({row.room_type_name})</span>
                </td>
                <td className="py-2 pr-2 text-right">{formatNumber(row.used_days, 1)}</td>
                <td className="py-2 pr-2 text-right">{row.period_days}</td>
                <td className="py-2 pr-2 text-right">{formatNumber(row.occupancy_rate, 1)}%</td>
                <td className="py-2 pr-2 text-right">{row.booking_count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-8 text-sm font-bold uppercase underline">Tổng kết công suất phòng</h2>
        <div className="mt-3 divide-y divide-slate-300 border-y border-slate-400 text-[11px]">
          <SummaryPrintRow label="Công suất trung bình toàn cơ sở" value={`${formatNumber(summary.average_occupancy, 1)}%`} />
          <SummaryPrintRow
            label="Phòng/loại phòng có công suất cao nhất"
            value={summary.highest_room ? `${summary.highest_room.room_code} (${summary.highest_room.room_type_name}) - ${formatNumber(summary.highest_room.occupancy_rate, 1)}%` : 'Không có'}
          />
          <SummaryPrintRow
            label="Phòng/loại phòng có công suất thấp nhất"
            value={summary.lowest_room ? `${summary.lowest_room.room_code} (${summary.lowest_room.room_type_name}) - ${formatNumber(summary.lowest_room.occupancy_rate, 1)}%` : 'Không có'}
          />
          <SummaryPrintRow label="Tổng số phòng được sử dụng trong kỳ" value={summary.total_used_days ?? 0} />
        </div>
      </div>
    </section>,
    document.body
  );
}

function SummaryPrintRow({ label, value }) {
  return (
    <div className="grid grid-cols-[1fr_220px] gap-4 py-2">
      <span className="font-semibold">{label}</span>
      <span>{value}</span>
    </div>
  );
}
