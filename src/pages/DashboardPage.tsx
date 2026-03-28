import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import {
  Users,
  CalendarDays,
  Ticket,
  DollarSign,
  CalendarCheck,
} from 'lucide-react';
import { useDashboardAdminViewModel } from '@/features/dashboard/presentation/viewmodels/dashboard-admin.viewmodel';
import { Shimmer, ShimmerText } from '@/components/ui/Shimmer';

interface AdminStats {
  totalUsers: number;
  activeEvents: number;
  totalRestaurants: number;
  totalTours: number;
  ticketsSoldThisMonth: number;
  revenueThisMonth: number;
  pendingModerationReports: number;
  activeSubscriptions: number;
}

interface RevenueItem {
  month: string;
  revenue: number;
}

interface TicketCategory {
  name: string;
  count: number;
}

interface UserGrowthItem {
  month: string;
  count: number;
}

interface RecentEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  ticketsSold: number;
  capacity: number;
  status: string;
}

function buildStatsCards(stats: AdminStats) {
  return [
    { label: 'Usuarios Totales', value: stats.totalUsers.toLocaleString('es-MX'), icon: Users, color: 'var(--primary)' },
    { label: 'Eventos Activos', value: String(stats.activeEvents), icon: CalendarDays, color: 'var(--accent)' },
    { label: 'Tickets Vendidos', value: stats.ticketsSoldThisMonth.toLocaleString('es-MX'), icon: Ticket, color: 'var(--secondary)' },
    { label: 'Ingresos del Mes', value: `$${(stats.revenueThisMonth / 1000).toFixed(0)}k MXN`, icon: DollarSign, color: 'var(--success)' },
  ];
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  activo: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  active: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  completado: { bg: 'var(--success-container)', text: 'var(--success)' },
  completed: { bg: 'var(--success-container)', text: 'var(--success)' },
  pendiente: { bg: 'var(--warning-container)', text: 'var(--warning)' },
  pending: { bg: 'var(--warning-container)', text: 'var(--warning)' },
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-MX')}`;
}

export default function DashboardPage() {
  const {
    stats,
    revenueByMonth,
    ticketsByCategory,
    userGrowth,
    recentEvents,
    isLoading: loading,
  } = useDashboardAdminViewModel();

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Shimmer className="h-8 w-40 rounded" />
          <Shimmer className="h-4 w-48 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <ShimmerText width="60%" />
              <Shimmer className="h-8 w-24 mt-2 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Shimmer className="h-64 rounded-2xl" />
          <Shimmer className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const statsCards = buildStatsCards(stats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Dashboard
        </h1>
        <span
          className="text-sm capitalize"
          style={{ color: 'var(--text-muted)' }}
        >
          {today}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border p-6"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                    color: card.color,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {card.value}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {card.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <h2
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Ingresos Mensuales
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueByMonth}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-container)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
              }}
              formatter={(value) => [formatCurrency(Number(value)), 'Ingresos']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-Column Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tickets by Category */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Tickets por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={ticketsByCategory}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-container)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value) => [
                  Number(value).toLocaleString('es-MX'),
                  'Tickets',
                ]}
              />
              <Bar
                dataKey="tickets"
                fill="var(--primary)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Crecimiento de Usuarios
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-container)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value) => [
                  Number(value).toLocaleString('es-MX'),
                  'Usuarios',
                ]}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <h2
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {recentEvents.slice(0, 5).map((ev: { id: string; title: string; organizer: string; date: string; ticketsSold: number; capacity: number; status: string }) => (
            <div
              key={ev.id}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ backgroundColor: 'var(--surface-container)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                    color: 'var(--accent)',
                  }}
                >
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {ev.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {ev.organizer} · {ev.ticketsSold}/{ev.capacity} tickets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  {new Date(ev.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                  style={{
                    backgroundColor: (statusStyles[ev.status] ?? statusStyles.pendiente).bg,
                    color: (statusStyles[ev.status] ?? statusStyles.pendiente).text,
                  }}
                >
                  {ev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
