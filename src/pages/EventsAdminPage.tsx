import { useState, useEffect } from 'react';
import { useEventsAdminViewModel } from '@/features/events/presentation/viewmodels/events-admin.viewmodel';
import { ShimmerTable } from '@/components/ui/Shimmer';

interface TicketType {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  category: string;
  city: string;
  date: string;
  endDate: string;
  venue: string;
  price: number;
  ticketsSold: number;
  capacity: number;
  status: string;
  featured: boolean;
  is18Plus: boolean;
  imageUrl: string;
  ticketTypes: TicketType[];
}

interface EventStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  draft: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

interface PaginatedResponse {
  data: EventItem[];
  total: number;
  page: number;
  pageSize: number;
}

const categories = [
  { value: '', label: 'Todas las categorias' },
  { value: 'conciertos', label: 'Conciertos' },
  { value: 'festivales', label: 'Festivales' },
  { value: 'vida_nocturna', label: 'Vida Nocturna' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'conferencias', label: 'Conferencias' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'gastronomia', label: 'Gastronomia' },
];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const categoryLabelMap: Record<string, string> = {
  conciertos: 'Conciertos',
  festivales: 'Festivales',
  vida_nocturna: 'Vida Nocturna',
  deportes: 'Deportes',
  cultural: 'Cultural',
  conferencias: 'Conferencias',
  teatro: 'Teatro',
  gastronomia: 'Gastronomia',
};

const categoryColorMap: Record<string, string> = {
  conciertos: 'var(--primary)',
  festivales: 'var(--secondary)',
  vida_nocturna: 'var(--accent)',
  deportes: 'var(--success)',
  cultural: 'var(--warning)',
  conferencias: 'var(--error)',
  teatro: 'var(--primary)',
  gastronomia: 'var(--secondary)',
};

const statusLabelMap: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const statusColorMap: Record<string, string> = {
  draft: 'var(--text-muted)',
  active: 'var(--success)',
  pending: 'var(--warning)',
  completed: 'var(--accent)',
  cancelled: 'var(--error)',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

const emptyEvent = {
  title: '',
  description: '',
  category: 'conciertos',
  city: '',
  date: '',
  endDate: '',
  venue: '',
  price: 0,
  capacity: 0,
  is18Plus: false,
  featured: false,
  imageUrl: '',
  ticketTypes: [{ name: 'General', price: 0, quantity: 100 }] as TicketType[],
};

export default function EventsAdminPage() {
  const vm = useEventsAdminViewModel();
  const events = vm.events as unknown as EventItem[];
  const loading = vm.isLoading;
  const total = events.length;
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const stats: EventStats = {
    total: events.length,
    active: vm.eventsByStatus.active?.length ?? 0,
    completed: vm.eventsByStatus.completed?.length ?? 0,
    cancelled: vm.eventsByStatus.cancelled?.length ?? 0,
    draft: vm.eventsByStatus.draft?.length ?? 0,
    totalTicketsSold: vm.totalTicketsSold,
    totalRevenue: vm.totalRevenue,
  };

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<'' | 'true' | 'false'>('');
  const [is18PlusFilter, setIs18PlusFilter] = useState<'' | 'true' | 'false'>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals
  const [editModal, setEditModal] = useState<EventItem | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState(emptyEvent);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setStatusFilter(statusFilter ? statusFilter as any : undefined); }, [statusFilter]);
  useEffect(() => { vm.setCategoryFilter(categoryFilter || undefined); }, [categoryFilter]);
  useEffect(() => { vm.setPage(page); }, [page]);
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter, cityFilter, featuredFilter, is18PlusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function toggleFeatured(event: EventItem) {
    setActionLoading(event.id);
    try {
      await vm.featureEvent.mutateAsync({ id: event.id, featured: !event.featured });
    } finally {
      setActionLoading(null);
    }
  }

  async function updateEventStatus(eventId: string, newStatus: string) {
    setActionLoading(eventId);
    try {
      if (newStatus === 'cancelled') {
        await vm.cancelEvent.mutateAsync(eventId);
      } else if (newStatus === 'active') {
        await vm.activateEvent.mutateAsync(eventId);
      } else {
        await vm.updateEvent.mutateAsync({ id: eventId, params: { status: newStatus } as any });
      }
    } finally {
      setActionLoading(null);
    }
  }

  function openEdit(event: EventItem) {
    setEditModal(event);
    setFormData({
      title: event.title,
      description: event.description ?? '',
      category: event.category,
      city: event.city,
      date: event.date?.slice(0, 16) ?? '',
      endDate: event.endDate?.slice(0, 16) ?? '',
      venue: event.venue ?? '',
      price: event.price,
      capacity: event.capacity,
      is18Plus: event.is18Plus,
      featured: event.featured,
      imageUrl: event.imageUrl ?? '',
      ticketTypes: event.ticketTypes?.length ? event.ticketTypes : [{ name: 'General', price: 0, quantity: 100 }],
    });
  }

  function openCreate() {
    setCreateModal(true);
    setFormData({ ...emptyEvent, ticketTypes: [{ name: 'General', price: 0, quantity: 100 }] });
  }

  async function saveEvent() {
    setSaving(true);
    try {
      if (editModal) {
        await vm.updateEvent.mutateAsync({ id: editModal.id, params: formData as any });
      } else {
        await vm.createEvent.mutateAsync(formData as any);
      }
      setEditModal(null);
      setCreateModal(false);
    } finally {
      setSaving(false);
    }
  }

  function addTicketType() {
    setFormData({ ...formData, ticketTypes: [...formData.ticketTypes, { name: '', price: 0, quantity: 50 }] });
  }

  function removeTicketType(index: number) {
    setFormData({ ...formData, ticketTypes: formData.ticketTypes.filter((_, i) => i !== index) });
  }

  function updateTicketType(index: number, field: string, value: string | number) {
    const updated = [...formData.ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ticketTypes: updated });
  }

  const statCards = [
    { label: 'Total', value: String(stats.total), color: 'var(--primary)' },
    { label: 'Activos', value: String(stats.active), color: 'var(--success)' },
    { label: 'Completados', value: String(stats.completed), color: 'var(--accent)' },
    { label: 'Cancelados', value: String(stats.cancelled), color: 'var(--error)' },
    { label: 'Borradores', value: String(stats.draft), color: 'var(--text-muted)' },
    { label: 'Tickets vendidos', value: stats.totalTicketsSold.toLocaleString('es-MX'), color: 'var(--secondary)' },
    { label: 'Ingresos totales', value: formatCurrency(stats.totalRevenue), color: 'var(--warning)' },
  ];

  const showModal = editModal || createModal;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Gestion de Eventos
        </h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          + Crear Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border text-sm outline-none focus:ring-2"
          style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Ciudad..."
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none w-36"
          style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value as '' | 'true' | 'false')}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Destacados: Todos</option>
          <option value="true">Solo destacados</option>
          <option value="false">No destacados</option>
        </select>
        <select
          value={is18PlusFilter}
          onChange={(e) => setIs18PlusFilter(e.target.value as '' | 'true' | 'false')}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">+18: Todos</option>
          <option value="true">Solo +18</option>
          <option value="false">Todo publico</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>a</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <ShimmerTable rows={8} cols={8} />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No se encontraron eventos</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Intenta cambiar los filtros de busqueda</p>
        </div>
      ) : (
        <>
          <div
            className="rounded-2xl border overflow-x-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-container)' }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Titulo</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Categoria</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Ciudad</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Precio</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Estado</th>
                  <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Destacado</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Tickets</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => {
                  const pct = event.capacity > 0 ? (event.ticketsSold / event.capacity) * 100 : 0;
                  return (
                    <tr
                      key={event.id}
                      className="border-t transition-colors hover:brightness-110"
                      style={{
                        backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate" style={{ color: 'var(--text-primary)' }}>
                        {event.title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: categoryColorMap[event.category] ?? 'var(--text-muted)', color: '#fff' }}
                        >
                          {categoryLabelMap[event.category] ?? event.category}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {event.city || '-'}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(event.date)}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(event.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: statusColorMap[event.status] ?? 'var(--text-muted)', color: '#fff' }}
                        >
                          {statusLabelMap[event.status] ?? event.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleFeatured(event)}
                          disabled={actionLoading === event.id}
                          className="text-lg disabled:opacity-50"
                          title={event.featured ? 'Quitar destacado' : 'Destacar'}
                          style={{ color: event.featured ? 'var(--secondary)' : 'var(--text-muted)' }}
                        >
                          {event.featured ? '\u2605' : '\u2606'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                            {event.ticketsSold}/{event.capacity}
                          </span>
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden max-w-[80px]"
                            style={{ backgroundColor: 'var(--surface-variant)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: 'var(--primary)' }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => openEdit(event)}
                            disabled={actionLoading === event.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}
                          >
                            Editar
                          </button>
                          {event.status !== 'active' && event.status !== 'completed' && (
                            <button
                              onClick={() => updateEventStatus(event.id, 'active')}
                              disabled={actionLoading === event.id}
                              className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                              style={{ backgroundColor: 'var(--success)', color: '#fff', borderColor: 'var(--success)' }}
                            >
                              Activar
                            </button>
                          )}
                          {event.status !== 'cancelled' && event.status !== 'completed' && (
                            <button
                              onClick={() => updateEventStatus(event.id, 'cancelled')}
                              disabled={actionLoading === event.id}
                              className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                              style={{ backgroundColor: 'transparent', color: 'var(--error)', borderColor: 'var(--error)' }}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-40"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="px-3 py-1.5 rounded-lg text-sm border transition-colors"
                    style={{
                      backgroundColor: page === p ? 'var(--primary)' : 'var(--surface)',
                      color: page === p ? '#fff' : 'var(--text-primary)',
                      borderColor: page === p ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-40"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div
            className="rounded-2xl p-6 w-full max-w-2xl space-y-4 border my-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {editModal ? 'Editar Evento' : 'Crear Evento'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Titulo</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Descripcion</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {categories.filter((c) => c.value).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Ciudad</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Fecha inicio</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Fecha fin</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Precio base (MXN)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Capacidad total</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>URL Imagen</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  Destacado
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.is18Plus}
                    onChange={(e) => setFormData({ ...formData, is18Plus: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  +18
                </label>
              </div>
            </div>

            {/* Ticket Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tipos de Ticket</p>
                <button
                  onClick={addTicketType}
                  className="text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-2">
                {formData.ticketTypes.map((tt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nombre (ej: VIP)"
                      value={tt.name}
                      onChange={(e) => updateTicketType(i, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none"
                      style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={tt.price}
                      onChange={(e) => updateTicketType(i, 'price', Number(e.target.value))}
                      className="w-28 px-3 py-1.5 rounded-lg border text-sm outline-none"
                      style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={tt.quantity}
                      onChange={(e) => updateTicketType(i, 'quantity', Number(e.target.value))}
                      className="w-28 px-3 py-1.5 rounded-lg border text-sm outline-none"
                      style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                    {formData.ticketTypes.length > 1 && (
                      <button
                        onClick={() => removeTicketType(i)}
                        className="text-sm px-2 py-1 rounded-lg transition-colors"
                        style={{ color: 'var(--error)' }}
                        title="Eliminar"
                      >
                        &#10005;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setEditModal(null); setCreateModal(false); }}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={saveEvent}
                disabled={saving || !formData.title}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                {saving ? 'Guardando...' : editModal ? 'Guardar Cambios' : 'Crear Evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
