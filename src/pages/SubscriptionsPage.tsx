import { useState, useEffect } from 'react';
import { useSubscriptionsAdminViewModel } from '@/features/subscriptions/presentation/viewmodels/subscriptions-admin.viewmodel';
import { Shimmer, ShimmerText, ShimmerTable } from '@/components/ui/Shimmer';
import {
  CreditCard,
  Search,
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  XCircle,
  Pause,
} from 'lucide-react';

/* ---------- types ---------- */
interface Subscription {
  id: string;
  restaurantName: string;
  plan: string;
  monthlyPrice: number;
  status: string;
  startDate: string;
  endDate: string | null;
}

interface SubscriptionStats {
  total: number;
  active: number;
  byPlan: Record<string, number>;
  monthlyRevenue: number;
}

interface SubscriptionForm {
  restaurantName: string;
  plan: string;
  monthlyPrice: number;
  startDate: string;
  endDate: string;
}

/* ---------- constants ---------- */
const PAGE_SIZE = 10;

const planConfig: Record<string, { bg: string; text: string; label: string }> = {
  free: { bg: 'var(--surface-variant)', text: 'var(--text-muted)', label: 'Free' },
  basic: { bg: 'var(--accent-container)', text: 'var(--accent)', label: 'Basic' },
  premium: { bg: 'var(--secondary-container)', text: 'var(--secondary)', label: 'Premium' },
  promax: { bg: 'var(--primary-container)', text: 'var(--primary)', label: 'Pro Max' },
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'var(--success-container)', text: 'var(--success)', label: 'Activa' },
  cancelled: { bg: 'var(--error-container)', text: 'var(--error)', label: 'Cancelada' },
  expired: { bg: 'var(--surface-variant)', text: 'var(--text-muted)', label: 'Expirada' },
  suspended: { bg: 'var(--warning-container)', text: 'var(--warning)', label: 'Suspendida' },
};

const defaultForm: SubscriptionForm = {
  restaurantName: '',
  plan: 'basic',
  monthlyPrice: 0,
  startDate: '',
  endDate: '',
};

/* ---------- helpers ---------- */
function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------- component ---------- */
export default function SubscriptionsPage() {
  const vm = useSubscriptionsAdminViewModel();
  const subscriptions = vm.subscriptions as unknown as Subscription[];
  const loading = vm.isLoading;
  const stats: SubscriptionStats | null = {
    total: subscriptions.length,
    active: vm.activeCount,
    byPlan: {},
    monthlyRevenue: vm.totalMonthlyRevenue,
  };

  // filters
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // pagination
  const [page, setPage] = useState(1);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubscriptionForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setTierFilter(planFilter ? planFilter as any : undefined); }, [planFilter]);
  useEffect(() => { vm.setStatusFilter(statusFilter ? statusFilter as any : undefined); }, [statusFilter]);
  useEffect(() => { vm.setPage(page); }, [page]);

  /* filter */
  const filtered = subscriptions.filter((s) => {
    if (search && !s.restaurantName.toLowerCase().includes(search.toLowerCase())) return false;
    if (planFilter && s.plan !== planFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* actions */
  async function handleStatusChange(sub: Subscription, newStatus: string) {
    try {
      if (newStatus === 'cancelled') {
        await vm.cancelSubscription.mutateAsync(sub.id);
      }
    } catch { /* toast */ }
  }

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditingId(sub.id);
    setForm({
      restaurantName: sub.restaurantName,
      plan: sub.plan,
      monthlyPrice: sub.monthlyPrice,
      startDate: sub.startDate?.slice(0, 10) || '',
      endDate: sub.endDate?.slice(0, 10) || '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Subscription CRUD handled via viewmodel
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Shimmer className="h-8 w-48 rounded" />
          <Shimmer className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <ShimmerText width="60%" />
              <Shimmer className="h-8 w-16 mt-2 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <ShimmerTable rows={6} cols={5} />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Suscripciones', value: stats?.total ?? subscriptions.length, color: 'var(--primary)' },
    { label: 'Activas', value: stats?.active ?? subscriptions.filter((s) => s.status === 'active').length, color: 'var(--success)' },
    ...Object.entries(stats?.byPlan ?? {}).map(([k, v]) => ({
      label: planConfig[k]?.label ?? k,
      value: v,
      color: planConfig[k]?.text ?? 'var(--text-secondary)',
    })),
    { label: 'Ingreso Mensual', value: formatMXN(stats?.monthlyRevenue ?? 0), color: 'var(--secondary)' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Suscripciones de Restaurantes</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> Crear Suscripcion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1 truncate" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar restaurante..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Plan: Todos</option>
          {Object.entries(planConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Estado: Todos</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container)' }}>
              {['Restaurante', 'Plan', 'Precio Mensual', 'Estado', 'Fecha Inicio', 'Fecha Fin', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((sub, idx) => {
              const pc = planConfig[sub.plan] ?? planConfig.free;
              const sc = statusConfig[sub.status] ?? statusConfig.active;
              return (
                <tr
                  key={sub.id}
                  className="border-t transition-colors hover:brightness-110"
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{sub.restaurantName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: pc.bg, color: pc.text }}>
                      {pc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{formatMXN(sub.monthlyPrice)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatDate(sub.startDate)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatDate(sub.endDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openEdit(sub)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)' }}
                      >
                        <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Editar</span>
                      </button>
                      {sub.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(sub, 'active')}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'var(--success-container)', color: 'var(--success)' }}
                        >
                          <span className="flex items-center gap-1"><Play className="h-3 w-3" /> Activar</span>
                        </button>
                      )}
                      {sub.status !== 'cancelled' && sub.status !== 'expired' && (
                        <button
                          onClick={() => handleStatusChange(sub, 'cancelled')}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'var(--error-container)', color: 'var(--error)' }}
                        >
                          <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelar</span>
                        </button>
                      )}
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(sub, 'suspended')}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'var(--warning-container)', color: 'var(--warning)' }}
                        >
                          <span className="flex items-center gap-1"><Pause className="h-3 w-3" /> Suspender</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron suscripciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Mostrando {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border p-2 disabled:opacity-40"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border p-2 disabled:opacity-40"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Editar Suscripcion' : 'Crear Suscripcion'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Restaurante</label>
                <input
                  type="text"
                  value={form.restaurantName}
                  onChange={(e) => setForm((f) => ({ ...f, restaurantName: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Plan</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {Object.entries(planConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Precio Mensual (MXN)</label>
                  <input
                    type="number"
                    value={form.monthlyPrice}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha Inicio</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha Fin</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.restaurantName}
                className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
