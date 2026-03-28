import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  CalendarDays,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

const stats = [
  { label: 'Usuarios totales', value: '12,450', icon: Users, color: 'var(--primary)' },
  { label: 'Eventos este mes', value: '34', icon: CalendarDays, color: 'var(--accent)' },
  { label: 'Ingresos totales', value: '$4.5M', icon: DollarSign, color: 'var(--secondary)' },
  { label: 'Tasa retencion', value: '68%', icon: RefreshCw, color: 'var(--success)' },
];

const revenueData = [
  { month: 'Oct', revenue: 520000 },
  { month: 'Nov', revenue: 680000 },
  { month: 'Dic', revenue: 910000 },
  { month: 'Ene', revenue: 750000 },
  { month: 'Feb', revenue: 830000 },
  { month: 'Mar', revenue: 810000 },
];

const userGrowthData = [
  { month: 'Oct', users: 9200 },
  { month: 'Nov', users: 9800 },
  { month: 'Dic', users: 10500 },
  { month: 'Ene', users: 11200 },
  { month: 'Feb', users: 11900 },
  { month: 'Mar', users: 12450 },
];

const eventsByCategoryData = [
  { category: 'Conciertos', count: 12 },
  { category: 'Festivales', count: 8 },
  { category: 'Teatro', count: 5 },
  { category: 'Deportes', count: 4 },
  { category: 'Gastronomia', count: 5 },
];

const citiesData = [
  { city: 'Torreon', users: 8200 },
  { city: 'Gomez Palacio', users: 2100 },
  { city: 'Lerdo', users: 1200 },
  { city: 'Matamoros', users: 950 },
];

const topEvents = [
  { name: 'Festival Lagunero 2026', ticketsSold: 4500, revenue: 1350000 },
  { name: 'Noche de Jazz Vol. 12', ticketsSold: 1200, revenue: 480000 },
  { name: 'Feria del Taco', ticketsSold: 3200, revenue: 320000 },
  { name: 'Concierto Sinfonica', ticketsSold: 800, revenue: 560000 },
  { name: 'Carrera Desierto 10K', ticketsSold: 2000, revenue: 300000 },
];

const maxCityUsers = Math.max(...citiesData.map((c) => c.users));

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-MX')}`;
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Analiticas de la Plataforma
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => {
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
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {card.value}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
        <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Ingresos (Ultimos 6 meses)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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
              fill="url(#analyticsRevenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Crecimiento de Usuarios
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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
                formatter={(value) => [Number(value).toLocaleString('es-MX'), 'Usuarios']}
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

        {/* Events by Category */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Eventos por Categoria
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventsByCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="category"
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-container)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value) => [Number(value), 'Eventos']}
              />
              <Bar dataKey="count" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users by City */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Usuarios por Ciudad
        </h2>
        <div className="space-y-3">
          {citiesData.map((c) => (
            <div key={c.city} className="flex items-center gap-4">
              <span
                className="w-32 shrink-0 text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {c.city}
              </span>
              <div className="flex-1">
                <div
                  className="h-8 rounded-lg"
                  style={{ backgroundColor: 'var(--surface-container)' }}
                >
                  <div
                    className="flex h-full items-center rounded-lg px-3"
                    style={{
                      width: `${(c.users / maxCityUsers) * 100}%`,
                      backgroundColor: `color-mix(in srgb, var(--primary) 20%, transparent)`,
                    }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--primary)' }}
                    >
                      {c.users.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Events by Sales */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Top Eventos por Venta
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-container)' }}>
                {['#', 'Evento', 'Tickets vendidos', 'Ingresos'].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topEvents.map((ev, i) => (
                <tr
                  key={ev.name}
                  className="border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {ev.name}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {ev.ticketsSold.toLocaleString('es-MX')}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--success)' }}>
                    {formatCurrency(ev.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
