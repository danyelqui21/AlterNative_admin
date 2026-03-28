import { useState, useEffect } from 'react';
import { useRestaurantsAdminViewModel } from '@/features/restaurants/presentation/viewmodels/restaurants-admin.viewmodel';
import { Shimmer, ShimmerText, ShimmerTable } from '@/components/ui/Shimmer';
import {
  Store,
  Search,
  Star,
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

/* ---------- types ---------- */
interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceRange: number; // 1-4
  subscriptionTier: string;
  active: boolean;
  hasPromos: boolean;
  phone?: string;
  address?: string;
  description?: string;
}

interface RestaurantStats {
  total: number;
  active: number;
  byCuisine: Record<string, number>;
  byTier: Record<string, number>;
}

interface RestaurantForm {
  name: string;
  cuisine: string;
  city: string;
  priceRange: number;
  subscriptionTier: string;
  phone: string;
  address: string;
  description: string;
}

/* ---------- constants ---------- */
const PAGE_SIZE = 10;

const tierStyles: Record<string, { bg: string; text: string; label: string }> = {
  free: { bg: 'var(--surface-variant)', text: 'var(--text-secondary)', label: 'Free' },
  basic: { bg: 'var(--accent-container)', text: 'var(--accent)', label: 'Basic' },
  premium: { bg: 'var(--secondary-container)', text: 'var(--secondary)', label: 'Premium' },
  promax: { bg: 'var(--primary-container)', text: 'var(--primary)', label: 'Pro Max' },
};

const defaultForm: RestaurantForm = {
  name: '',
  cuisine: '',
  city: '',
  priceRange: 2,
  subscriptionTier: 'free',
  phone: '',
  address: '',
  description: '',
};

/* ---------- helpers ---------- */
function renderStars(rating: number) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-3.5 w-3.5"
          style={{
            color: n <= Math.round(rating) ? 'var(--secondary)' : 'var(--border)',
            fill: n <= Math.round(rating) ? 'var(--secondary)' : 'none',
          }}
        />
      ))}
      <span className="ml-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{rating.toFixed(1)}</span>
    </span>
  );
}

function priceLabel(n: number) {
  return '$'.repeat(n);
}

/* ---------- component ---------- */
export default function RestaurantsAdminPage() {
  const vm = useRestaurantsAdminViewModel();
  const restaurants = vm.restaurants as unknown as Restaurant[];
  const loading = vm.isLoading;
  const stats: RestaurantStats | null = {
    total: restaurants.length,
    active: restaurants.filter((r) => r.active).length,
    byCuisine: {},
    byTier: {},
  };

  // filters
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');
  const [promosFilter, setPromosFilter] = useState<'' | 'true'>('');

  // pagination
  const [page, setPage] = useState(1);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RestaurantForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setCuisineFilter(cuisineFilter || undefined); }, [cuisineFilter]);
  useEffect(() => { vm.setCityFilter(cityFilter || undefined); }, [cityFilter]);

  /* filter logic */
  const filtered = restaurants.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (cuisineFilter && r.cuisine !== cuisineFilter) return false;
    if (cityFilter && r.city !== cityFilter) return false;
    if (tierFilter && r.subscriptionTier !== tierFilter) return false;
    if (activeFilter === 'true' && !r.active) return false;
    if (activeFilter === 'false' && r.active) return false;
    if (promosFilter === 'true' && !r.hasPromos) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* unique values for dropdowns */
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))].sort();
  const cities = [...new Set(restaurants.map((r) => r.city))].sort();

  /* actions */
  async function handleToggleActive(r: Restaurant) {
    try {
      await vm.updateRestaurant.mutateAsync({ id: r.id, params: { active: !r.active } as any });
    } catch { /* toast */ }
  }

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(r: Restaurant) {
    setEditingId(r.id);
    setForm({
      name: r.name,
      cuisine: r.cuisine,
      city: r.city,
      priceRange: r.priceRange,
      subscriptionTier: r.subscriptionTier,
      phone: r.phone || '',
      address: r.address || '',
      description: r.description || '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await vm.updateRestaurant.mutateAsync({ id: editingId, params: form as any });
      } else {
        await vm.createRestaurant.mutateAsync(form as any);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  /* loading state */
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
          <ShimmerTable rows={6} cols={6} />
        </div>
      </div>
    );
  }

  /* stats cards */
  const statCards = [
    { label: 'Total Restaurantes', value: stats?.total ?? restaurants.length, color: 'var(--primary)' },
    { label: 'Activos', value: stats?.active ?? restaurants.filter((r) => r.active).length, color: 'var(--success)' },
    ...Object.entries(stats?.byCuisine ?? {}).slice(0, 2).map(([k, v]) => ({
      label: k,
      value: v,
      color: 'var(--secondary)',
    })),
    ...Object.entries(stats?.byTier ?? {}).slice(0, 2).map(([k, v]) => ({
      label: tierStyles[k]?.label ?? k,
      value: v,
      color: tierStyles[k]?.text ?? 'var(--accent)',
    })),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Gestion de Restaurantes
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> Crear Restaurante
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
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
            placeholder="Buscar restaurante..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={cuisineFilter}
          onChange={(e) => { setCuisineFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Cocina: Todas</option>
          {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Ciudad: Todas</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Suscripcion: Todas</option>
          {Object.entries(tierStyles).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
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
          value={promosFilter}
          onChange={(e) => { setPromosFilter(e.target.value as '' | 'true'); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Promos: Todos</option>
          <option value="true">Con Promos</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container)' }}>
              {['Nombre', 'Cocina', 'Ciudad', 'Rating', 'Resenas', 'Precio', 'Suscripcion', 'Activo', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, idx) => {
              const tier = tierStyles[r.subscriptionTier] ?? tierStyles.free;
              return (
                <tr
                  key={r.id}
                  className="border-t transition-colors hover:brightness-110"
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--accent-container)', color: 'var(--accent)' }}>
                      {r.cuisine}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{r.city}</td>
                  <td className="px-4 py-3">{renderStars(r.rating)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{r.reviewCount}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{priceLabel(r.priceRange)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: tier.bg, color: tier.text }}>
                      {tier.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: r.active ? 'var(--success)' : 'var(--error)' }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)' }}
                      >
                        <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Editar</span>
                      </button>
                      <button
                        onClick={() => handleToggleActive(r)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: r.active ? 'var(--error-container)' : 'var(--success-container)',
                          color: r.active ? 'var(--error)' : 'var(--success)',
                        }}
                      >
                        <span className="flex items-center gap-1">
                          {r.active ? <><ToggleRight className="h-3 w-3" /> Desactivar</> : <><ToggleLeft className="h-3 w-3" /> Activar</>}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron restaurantes
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
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {page} / {totalPages}
          </span>
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
                {editingId ? 'Editar Restaurante' : 'Crear Restaurante'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Nombre', type: 'text' },
                { key: 'cuisine', label: 'Tipo de Cocina', type: 'text' },
                { key: 'city', label: 'Ciudad', type: 'text' },
                { key: 'phone', label: 'Telefono', type: 'text' },
                { key: 'address', label: 'Direccion', type: 'text' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={(form as Record<string, string | number>)[field.key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descripcion</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Rango de Precio</label>
                  <select
                    value={form.priceRange}
                    onChange={(e) => setForm((f) => ({ ...f, priceRange: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{'$'.repeat(n)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Suscripcion</label>
                  <select
                    value={form.subscriptionTier}
                    onChange={(e) => setForm((f) => ({ ...f, subscriptionTier: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {Object.entries(tierStyles).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
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
                disabled={saving || !form.name}
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
