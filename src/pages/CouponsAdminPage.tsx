import { useState, useEffect } from 'react';
import { useCouponsAdminViewModel } from '@/features/coupons/presentation/viewmodels/coupons-admin.viewmodel';
import { Shimmer, ShimmerText, ShimmerTable } from '@/components/ui/Shimmer';
import {
  Tag,
  Search,
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

/* ---------- types ---------- */
interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minPurchase: number;
  maxRedemptions: number;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
}

interface CouponStats {
  total: number;
  active: number;
  expired: number;
  redemptions: number;
}

interface CouponForm {
  code: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minPurchase: number;
  maxRedemptions: number;
  expiresAt: string;
}

/* ---------- constants ---------- */
const PAGE_SIZE = 10;

const defaultForm: CouponForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  minPurchase: 0,
  maxRedemptions: 0,
  expiresAt: '',
};

/* ---------- helpers ---------- */
function formatDiscount(type: string, value: number): string {
  return type === 'percentage' ? `${value}%` : `$${value.toLocaleString('es-MX')}`;
}

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Sin limite';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------- component ---------- */
export default function CouponsAdminPage() {
  const vm = useCouponsAdminViewModel();
  const coupons = vm.coupons as unknown as Coupon[];
  const loading = vm.isLoading;
  const stats: CouponStats | null = {
    total: coupons.length,
    active: coupons.filter((c) => c.active).length,
    expired: 0,
    redemptions: vm.totalRedemptions,
  };

  // filters
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');
  const [typeFilter, setTypeFilter] = useState('');

  // pagination
  const [page, setPage] = useState(1);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setPage(page); }, [page]);

  /* filter */
  const filtered = coupons.filter((c) => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'true' && !c.active) return false;
    if (activeFilter === 'false' && c.active) return false;
    if (typeFilter && c.discountType !== typeFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* actions */
  async function handleToggleActive(c: Coupon) {
    try {
      await vm.updateCoupon.mutateAsync({ id: c.id, params: { active: !c.active } as any });
    } catch { /* toast */ }
  }

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minPurchase: c.minPurchase,
      maxRedemptions: c.maxRedemptions,
      expiresAt: c.expiresAt?.slice(0, 10) || '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await vm.updateCoupon.mutateAsync({ id: editingId, params: form as any });
      } else {
        await vm.createCoupon.mutateAsync(form as any);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Shimmer className="h-8 w-36 rounded" />
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
          <ShimmerTable rows={6} cols={6} />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Cupones', value: stats?.total ?? coupons.length, color: 'var(--primary)' },
    { label: 'Activos', value: stats?.active ?? coupons.filter((c) => c.active).length, color: 'var(--success)' },
    { label: 'Expirados', value: stats?.expired ?? 0, color: 'var(--error)' },
    { label: 'Canjes Totales', value: stats?.redemptions ?? coupons.reduce((s, c) => s + c.usedCount, 0), color: 'var(--secondary)' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-7 w-7" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Cupones</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> Crear Cupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar codigo o descripcion..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value as '' | 'true' | 'false'); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Estado: Todos</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Tipo: Todos</option>
          <option value="fixed">Monto Fijo</option>
          <option value="percentage">Porcentaje</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container)' }}>
              {['Codigo', 'Descripcion', 'Descuento', 'Compra Min', 'Uso/Max', 'Expira', 'Activo', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((c, idx) => (
              <tr
                key={c.id}
                className="border-t transition-colors hover:brightness-110"
                style={{
                  backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                  borderColor: 'var(--border)',
                }}
              >
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.code}</span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{c.description}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: c.discountType === 'percentage' ? 'var(--accent-container)' : 'var(--secondary-container)',
                      color: c.discountType === 'percentage' ? 'var(--accent)' : 'var(--secondary)',
                    }}
                  >
                    {formatDiscount(c.discountType, c.discountValue)}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {c.minPurchase > 0 ? formatMXN(c.minPurchase) : '-'}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                  {c.usedCount}/{c.maxRedemptions > 0 ? c.maxRedemptions : 'ilim.'}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatDate(c.expiresAt)}</td>
                <td className="px-4 py-3">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.active ? 'var(--success)' : 'var(--error)' }} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)' }}
                    >
                      <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Editar</span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(c)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: c.active ? 'var(--error-container)' : 'var(--success-container)',
                        color: c.active ? 'var(--error)' : 'var(--success)',
                      }}
                    >
                      <span className="flex items-center gap-1">
                        {c.active ? <><ToggleRight className="h-3 w-3" /> Desactivar</> : <><ToggleLeft className="h-3 w-3" /> Activar</>}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron cupones
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
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Editar Cupon' : 'Crear Cupon'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Codigo</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="VERANO2026"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none font-mono"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descripcion</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tipo de Descuento</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as 'fixed' | 'percentage' }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Valor ({form.discountType === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Compra Minima (MXN)</label>
                  <input
                    type="number"
                    value={form.minPurchase}
                    onChange={(e) => setForm((f) => ({ ...f, minPurchase: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Max Canjes (0 = ilimitado)</label>
                  <input
                    type="number"
                    value={form.maxRedemptions}
                    onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha de Expiracion</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
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
                disabled={saving || !form.code}
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
