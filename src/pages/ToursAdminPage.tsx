import { useState, useEffect } from 'react';
import { useToursAdminViewModel } from '@/features/tours/presentation/viewmodels/tours-admin.viewmodel';
import { Shimmer, ShimmerTable } from '@/components/ui/Shimmer';
import {
  Map,
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
interface Tour {
  id: string;
  title: string;
  type: string;
  duration: string;
  price: number;
  rating: number;
  availableDate: string;
  active: boolean;
  firstParty: boolean;
  description?: string;
  imageUrl?: string;
  maxCapacity?: number;
}

interface TourForm {
  title: string;
  type: string;
  duration: string;
  price: number;
  availableDate: string;
  firstParty: boolean;
  description: string;
  imageUrl: string;
  maxCapacity: number;
}

/* ---------- constants ---------- */
const PAGE_SIZE = 10;

const typeOptions = [
  { value: 'gastronomico', label: 'Gastronomico' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'vida_nocturna', label: 'Vida Nocturna' },
  { value: 'aventura', label: 'Aventura' },
];

const typeStyles: Record<string, { bg: string; text: string }> = {
  gastronomico: { bg: 'var(--secondary-container)', text: 'var(--secondary)' },
  cultural: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  vida_nocturna: { bg: 'var(--primary-container)', text: 'var(--primary)' },
  aventura: { bg: 'var(--success-container)', text: 'var(--success)' },
};

const defaultForm: TourForm = {
  title: '',
  type: 'gastronomico',
  duration: '',
  price: 0,
  availableDate: '',
  firstParty: false,
  description: '',
  imageUrl: '',
  maxCapacity: 20,
};

/* ---------- helpers ---------- */
function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------- component ---------- */
export default function ToursAdminPage() {
  const vmTours = useToursAdminViewModel();
  const tours = vmTours.tours as unknown as Tour[];
  const loading = vmTours.isLoading;

  // filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [firstPartyFilter, setFirstPartyFilter] = useState<'' | 'true'>('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');

  // pagination
  const [page, setPage] = useState(1);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TourForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vmTours.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vmTours.setPage(page); }, [page]);

  /* filter */
  const filtered = tours.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && t.type !== typeFilter) return false;
    if (firstPartyFilter === 'true' && !t.firstParty) return false;
    if (activeFilter === 'true' && !t.active) return false;
    if (activeFilter === 'false' && t.active) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* actions */
  async function handleToggleActive(t: Tour) {
    try {
      await vmTours.updateTour.mutateAsync({ id: t.id, params: { active: !t.active } as any });
    } catch { /* toast */ }
  }

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(t: Tour) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      type: t.type,
      duration: t.duration,
      price: t.price,
      availableDate: t.availableDate?.slice(0, 10) || '',
      firstParty: t.firstParty,
      description: t.description || '',
      imageUrl: t.imageUrl || '',
      maxCapacity: t.maxCapacity || 20,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await vmTours.updateTour.mutateAsync({ id: editingId, params: form as any });
      } else {
        await vmTours.createTour.mutateAsync(form as any);
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
          <Shimmer className="h-8 w-32 rounded" />
          <Shimmer className="h-10 w-36 rounded-xl" />
        </div>
        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <ShimmerTable rows={6} cols={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="h-7 w-7" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tours</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> Crear Tour
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar tour..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Tipo: Todos</option>
          {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={firstPartyFilter}
          onChange={(e) => { setFirstPartyFilter(e.target.value as '' | 'true'); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">First Party: Todos</option>
          <option value="true">Solo First Party</option>
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
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container)' }}>
              {['Titulo', 'Tipo', 'Duracion', 'Precio', 'Rating', 'Fecha Disponible', 'Activo', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((t, idx) => {
              const ts = typeStyles[t.type] ?? { bg: 'var(--surface-variant)', text: 'var(--text-secondary)' };
              return (
                <tr
                  key={t.id}
                  className="border-t transition-colors hover:brightness-110"
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {t.title}
                    {t.firstParty && (
                      <span className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--primary-container)', color: 'var(--primary)' }}>
                        1st Party
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: ts.bg, color: ts.text }}>
                      {typeOptions.find((o) => o.value === t.type)?.label ?? t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{t.duration}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{formatMXN(t.price)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" style={{ color: 'var(--secondary)', fill: 'var(--secondary)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{t.rating?.toFixed(1) ?? '-'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{t.availableDate ? formatDate(t.availableDate) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.active ? 'var(--success)' : 'var(--error)' }} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)' }}
                      >
                        <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Editar</span>
                      </button>
                      <button
                        onClick={() => handleToggleActive(t)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: t.active ? 'var(--error-container)' : 'var(--success-container)',
                          color: t.active ? 'var(--error)' : 'var(--success)',
                        }}
                      >
                        <span className="flex items-center gap-1">
                          {t.active ? <><ToggleRight className="h-3 w-3" /> Desactivar</> : <><ToggleLeft className="h-3 w-3" /> Activar</>}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron tours
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
                {editingId ? 'Editar Tour' : 'Crear Tour'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Titulo</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Duracion</label>
                  <input
                    type="text"
                    placeholder="ej. 3 horas"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Precio (MXN)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Capacidad Max</label>
                  <input
                    type="number"
                    value={form.maxCapacity}
                    onChange={(e) => setForm((f) => ({ ...f, maxCapacity: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha Disponible</label>
                <input
                  type="date"
                  value={form.availableDate}
                  onChange={(e) => setForm((f) => ({ ...f, availableDate: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>URL de Imagen</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.firstParty}
                  onChange={(e) => setForm((f) => ({ ...f, firstParty: e.target.checked }))}
                  className="rounded"
                />
                <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>First Party (propio de LagunApp)</label>
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
                disabled={saving || !form.title}
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
