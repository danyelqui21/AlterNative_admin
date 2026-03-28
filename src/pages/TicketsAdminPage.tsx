import { useState, useEffect } from 'react';
import { useTicketsAdminViewModel } from '@/features/tickets/presentation/viewmodels/tickets-admin.viewmodel';
import { Shimmer } from '@/components/ui/Shimmer';
import {
  Ticket,
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  RotateCcw,
  CheckCircle,
  DollarSign,
  XCircle,
  RefreshCw,
  TicketCheck,
} from 'lucide-react';

interface TicketStats {
  total: number;
  active: number;
  used: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
}

interface TicketItem {
  id: string;
  eventTitle: string;
  ticketType: string;
  userId: string;
  price: number;
  quantity: number;
  status: 'active' | 'used' | 'cancelled' | 'refunded';
  qrCode: string;
  createdAt: string;
}

interface TicketsResponse {
  data: TicketItem[];
  total: number;
  page: number;
  limit: number;
}

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: 'active' },
  { label: 'Usado', value: 'used' },
  { label: 'Cancelado', value: 'cancelled' },
  { label: 'Reembolsado', value: 'refunded' },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: 'var(--success-container)', text: 'var(--success)' },
  used: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  cancelled: { bg: 'var(--error-container)', text: 'var(--error)' },
  refunded: { bg: 'var(--warning-container)', text: 'var(--warning)' },
};

const statusLabels: Record<string, string> = {
  active: 'Activo',
  used: 'Usado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export default function TicketsAdminPage() {
  const vm = useTicketsAdminViewModel();
  const tickets = vm.tickets as unknown as TicketItem[];
  const loading = vm.isLoading;
  const total = tickets.length;

  const stats: TicketStats | null = {
    total: tickets.length,
    active: vm.ticketsByStatus.active?.length ?? 0,
    used: vm.ticketsByStatus.used?.length ?? 0,
    cancelled: vm.ticketsByStatus.cancelled?.length ?? 0,
    refunded: vm.ticketsByStatus.refunded?.length ?? 0,
    totalRevenue: vm.totalRevenue,
  };

  // Filters
  const [status, setStatus] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Sync filters to viewmodel
  useEffect(() => { vm.setStatusFilter(status ? status as any : undefined); }, [status]);
  useEffect(() => { vm.setSearchFilter(eventSearch || undefined); }, [eventSearch]);
  useEffect(() => { vm.setPage(page); }, [page]);

  const handleAction = async (ticketId: string, action: 'cancel' | 'refund' | 'mark-used') => {
    try {
      if (action === 'cancel') {
        await vm.cancelTicket.mutateAsync(ticketId);
      } else if (action === 'refund') {
        await vm.refundTicket.mutateAsync(ticketId);
      } else {
        await vm.updateTicket.mutateAsync({ id: ticketId, params: { status: 'used' } as any });
      }
    } catch {
      /* ignore */
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statsCards = stats
    ? [
        { label: 'Total', value: stats.total.toLocaleString('es-MX'), icon: Ticket, color: 'var(--primary)' },
        { label: 'Activos', value: stats.active.toLocaleString('es-MX'), icon: CheckCircle, color: 'var(--success)' },
        { label: 'Usados', value: stats.used.toLocaleString('es-MX'), icon: TicketCheck, color: 'var(--accent)' },
        { label: 'Cancelados', value: stats.cancelled.toLocaleString('es-MX'), icon: XCircle, color: 'var(--error)' },
        { label: 'Reembolsados', value: stats.refunded.toLocaleString('es-MX'), icon: RotateCcw, color: 'var(--warning)' },
        { label: 'Ingresos totales', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'var(--secondary)' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Ticket className="h-8 w-8" style={{ color: 'var(--primary)' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Administracion de Tickets
        </h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border p-5"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                      color: card.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {card.value}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {card.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div
        className="flex flex-wrap items-end gap-3 rounded-2xl border p-4"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Estado</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              backgroundColor: 'var(--surface-container)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Evento</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar evento..."
              value={eventSearch}
              onChange={(e) => { setEventSearch(e.target.value); setPage(1); }}
              className="rounded-lg border py-2 pl-8 pr-3 text-sm"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Usuario</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setPage(1); }}
              className="rounded-lg border py-2 pl-8 pr-3 text-sm"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              backgroundColor: 'var(--surface-container)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              backgroundColor: 'var(--surface-container)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <button
          onClick={() => { setStatus(''); setEventSearch(''); setUserSearch(''); setDateFrom(''); setDateTo(''); setPage(1); }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Limpiar
        </button>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-container)' }}>
                {['Evento', 'Tipo Ticket', 'Usuario', 'Precio', 'Cant.', 'Estado', 'Codigo QR', 'Creado', 'Acciones'].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Shimmer className="h-5 rounded" style={{ width: `${50 + (j * 7) % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No se encontraron tickets</p>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const st = statusStyles[t.status] ?? { bg: 'var(--surface-variant)', text: 'var(--text-muted)' };
                  return (
                    <tr
                      key={t.id}
                      className="border-t"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {t.eventTitle}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {t.ticketType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {truncate(t.userId, 12)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(t.price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                        {t.quantity}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.text }}
                        >
                          {statusLabels[t.status] ?? t.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {truncate(t.qrCode, 16)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1">
                          {t.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleAction(t.id, 'mark-used')}
                                className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                                style={{ color: 'var(--accent)' }}
                                title="Marcar como usado"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAction(t.id, 'cancel')}
                                className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                                style={{ color: 'var(--error)' }}
                                title="Cancelar"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAction(t.id, 'refund')}
                                className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                                style={{ color: 'var(--warning)' }}
                                title="Reembolsar"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {t.status === 'used' && (
                            <button
                              onClick={() => handleAction(t.id, 'refund')}
                              className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                              style={{ color: 'var(--warning)' }}
                              title="Reembolsar"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between border-t px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg p-1.5 transition-colors disabled:opacity-40"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg p-1.5 transition-colors disabled:opacity-40"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
