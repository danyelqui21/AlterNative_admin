import { useState, useEffect } from 'react';
import { useTheatersAdminViewModel } from '@/features/theaters/presentation/viewmodels/theaters-admin.viewmodel';
import { SeatingLayoutEditor } from '@/features/theaters/components/SeatingLayoutEditor';
import { Shimmer, ShimmerTable } from '@/components/ui/Shimmer';
import {
  Theater,
  Search,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  ToggleLeft,
  ToggleRight,
  Armchair,
  MapPin,
  LayoutGrid,
  CalendarDays,
  Clock,
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { TheaterEntity, SeatingLayoutEntity } from '@/features/theaters/domain/entities/theater.entity';

/* ---------- constants ---------- */
const PAGE_SIZE = 10;

interface TheaterForm {
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl: string;
  phone: string;
  managerId: string;
}

const defaultForm: TheaterForm = {
  name: '',
  description: '',
  address: '',
  city: '',
  imageUrl: '',
  phone: '',
  managerId: '',
};

interface LayoutForm {
  name: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
}

const defaultLayoutForm: LayoutForm = {
  name: '',
  description: '',
  canvasWidth: 800,
  canvasHeight: 600,
};

/* ---------- component ---------- */
export default function TheatersAdminPage() {
  const vm = useTheatersAdminViewModel();
  const theaters = vm.theaters;
  const loading = vm.isLoading;

  // filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // theater modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TheaterForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // layout modal
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [layoutForm, setLayoutForm] = useState<LayoutForm>(defaultLayoutForm);
  const [layoutTheaterId, setLayoutTheaterId] = useState<string | null>(null);

  // salas panel
  const [salasOpen, setSalasOpen] = useState(false);
  const [salasTheater, setSalasTheater] = useState<TheaterEntity | null>(null);
  const [salasLayoutSeats, setSalasLayoutSeats] = useState<Record<string, { total: number; disabled: number; sections: Record<string, { count: number; price?: number }> }>>({});

  // events panel
  const [eventsOpen, setEventsOpen] = useState(false);
  const [eventsTheater, setEventsTheater] = useState<TheaterEntity | null>(null);
  const [theaterEventsList, setTheaterEventsList] = useState<any[]>([]);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', category: 'cultural', date: '', time: '20:00', price: 0, capacity: 0, imageUrl: '', layoutId: '', seatingMode: 'numbered' as 'numbered' | 'general' });

  // seat editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTheater, setEditorTheater] = useState<TheaterEntity | null>(null);
  const [editorLayout, setEditorLayout] = useState<SeatingLayoutEntity | null>(null);

  // Sync filters
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setPage(page); }, [page]);

  /* filter */
  const filtered = theaters.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* actions */
  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(t: TheaterEntity) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      description: t.description,
      address: t.address,
      city: t.city,
      imageUrl: t.imageUrl || '',
      phone: t.phone || '',
      managerId: t.managerId,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await vm.updateTheater.mutateAsync({ id: editingId, params: form });
      } else {
        await vm.createTheater.mutateAsync(form as any);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(t: TheaterEntity) {
    try {
      if (t.isActive) {
        await vm.disableTheater.mutateAsync(t.id);
      } else {
        await vm.enableTheater.mutateAsync(t.id);
      }
    } catch { /* toast */ }
  }

  async function openSalasPanel(theater: TheaterEntity) {
    setSalasTheater(theater);
    setSalasOpen(true);

    // Fetch seat counts for each layout
    if (theater.layouts && theater.layouts.length > 0) {
      try {
        const { TheatersAdminRemoteDatasource } = await import('@/features/theaters/data/datasources/theaters-admin.remote-datasource');
        const ds = new TheatersAdminRemoteDatasource();
        const counts: typeof salasLayoutSeats = {};
        await Promise.all(theater.layouts.map(async (layout) => {
          const full = await ds.getLayout(theater.id, layout.id);
          const seats = full?.seats || [];
          const sections: Record<string, { count: number; price?: number }> = {};
          let disabled = 0;
          for (const s of seats) {
            const sec = s.sectionName || 'Sin seccion';
            if (!sections[sec]) sections[sec] = { count: 0, price: s.price ? Number(s.price) : undefined };
            sections[sec].count++;
            if (!s.isActive) disabled++;
          }
          counts[layout.id] = { total: seats.length, disabled, sections };
        }));
        setSalasLayoutSeats(counts);
      } catch { /* ignore */ }
    }
  }

  async function openEventsPanel(theater: TheaterEntity) {
    setEventsTheater(theater);
    setEventsOpen(true);
    // Fetch events for this theater
    try {
      const { apiClient } = await import('@/core/api/api-client');
      const { data } = await apiClient.get(`/events`, { params: { search: theater.name, limit: 50 } });
      setTheaterEventsList(data?.data ?? data ?? []);
    } catch { setTheaterEventsList([]); }
  }

  async function handleCreateTheaterEvent() {
    if (!eventsTheater) return;
    setSaving(true);
    try {
      const { apiClient } = await import('@/core/api/api-client');
      // 1. Create the event
      const { data: event } = await apiClient.post('/admin/events', {
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        date: eventForm.date,
        time: eventForm.time,
        location: eventsTheater.name,
        city: eventsTheater.city,
        price: eventForm.price,
        imageUrl: eventForm.imageUrl,
        capacity: eventForm.capacity,
        isFeatured: true,
      });
      const eventId = event?.id ?? event?.data?.id;

      // 2. Link to theater
      await apiClient.post('/admin/theaters/events', {
        eventId,
        theaterId: eventsTheater.id,
        layoutId: eventForm.seatingMode === 'numbered' ? eventForm.layoutId : null,
        seatingMode: eventForm.seatingMode,
      });

      setEventFormOpen(false);
      // Refresh events list
      openEventsPanel(eventsTheater);
    } finally {
      setSaving(false);
    }
  }

  function openCreateLayout(theaterId: string) {
    setLayoutTheaterId(theaterId);
    setLayoutForm(defaultLayoutForm);
    setLayoutModalOpen(true);
  }

  async function handleCreateLayout() {
    if (!layoutTheaterId) return;
    setSaving(true);
    try {
      const { TheatersAdminRemoteDatasource } = await import('@/features/theaters/data/datasources/theaters-admin.remote-datasource');
      const { mapLayoutFromJson } = await import('@/features/theaters/data/models/theater.model');
      const ds = new TheatersAdminRemoteDatasource();
      const newLayout = await ds.createLayout(layoutTheaterId, layoutForm);
      setLayoutModalOpen(false);
      // Open the editor for the new layout
      const theater = theaters.find((t) => t.id === layoutTheaterId);
      if (theater && newLayout) {
        setEditorTheater(theater);
        setEditorLayout(mapLayoutFromJson(newLayout));
        setEditorOpen(true);
      }
    } finally {
      setSaving(false);
    }
  }

  async function openEditor(theater: TheaterEntity, layout: SeatingLayoutEntity) {
    // Fetch full layout with seats from API
    try {
      const { TheatersAdminRemoteDatasource } = await import('@/features/theaters/data/datasources/theaters-admin.remote-datasource');
      const { mapLayoutFromJson } = await import('@/features/theaters/data/models/theater.model');
      const ds = new TheatersAdminRemoteDatasource();
      const fullLayout = await ds.getLayout(theater.id, layout.id);
      setEditorTheater(theater);
      setEditorLayout(mapLayoutFromJson(fullLayout));
      setEditorOpen(true);
    } catch {
      // Fallback to what we have (no seats)
      setEditorTheater(theater);
      setEditorLayout(layout);
      setEditorOpen(true);
    }
  }

  // If editor is open, show fullscreen editor
  if (editorOpen && editorTheater && editorLayout) {
    return (
      <SeatingLayoutEditor
        theaterId={editorTheater.id}
        layoutId={editorLayout.id}
        layoutName={editorLayout.name}
        canvasWidth={editorLayout.canvasWidth}
        canvasHeight={editorLayout.canvasHeight}
        initialSeats={editorLayout.seats || []}
        onClose={() => {
          setEditorOpen(false);
          // Re-open Salas panel for the same theater
          if (editorTheater) {
            // Refresh theater data to get updated layouts
            const refreshed = theaters.find((t) => t.id === editorTheater.id);
            if (refreshed) {
              setSalasTheater(refreshed);
              setSalasOpen(true);
            }
          }
        }}
      />
    );
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
          <Armchair className="h-7 w-7" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Teatros</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> Crear Teatro
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar teatro..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container)' }}>
              {['Nombre', 'Ciudad', 'Direccion', 'Capacidad', 'Activo', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((t, idx) => (
              <tr
                key={t.id}
                className="border-t transition-colors hover:brightness-110"
                style={{
                  backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                  borderColor: 'var(--border)',
                }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  <div className="flex items-center gap-2">
                    <Armchair className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    {t.name}
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {t.city}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{t.address}</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t.capacity} asientos
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.isActive ? 'var(--success)' : 'var(--error)' }} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openSalasPanel(t)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: 'var(--primary-container)', color: 'var(--primary)' }}
                    >
                      <span className="flex items-center gap-1">
                        <LayoutGrid className="h-3 w-3" /> Salas ({t.layouts?.length || 0})
                      </span>
                    </button>
                    <button
                      onClick={() => openEventsPanel(t)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: 'var(--accent-container)', color: 'var(--accent)' }}
                    >
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> Eventos
                      </span>
                    </button>
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
                        backgroundColor: t.isActive ? 'var(--error-container)' : 'var(--success-container)',
                        color: t.isActive ? 'var(--error)' : 'var(--success)',
                      }}
                    >
                      <span className="flex items-center gap-1">
                        {t.isActive ? <><ToggleRight className="h-3 w-3" /> Desactivar</> : <><ToggleLeft className="h-3 w-3" /> Activar</>}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron teatros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Mostrando {Math.min(((page - 1) * PAGE_SIZE) + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
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

      {/* Create/Edit Theater Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Editar Teatro' : 'Crear Teatro'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre</label>
                <input
                  type="text"
                  placeholder="ej. Teatro Nazas, Cinepolis Forum"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ciudad</label>
                  <input
                    type="text"
                    placeholder="ej. Torreón"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Telefono</label>
                  <input
                    type="text"
                    placeholder="+52 (871) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Direccion</label>
                <input
                  type="text"
                  placeholder="ej. Blvd. Independencia #1500, Centro"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                folder="theaters"
                label="Imagen"
              />
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descripcion</label>
                <textarea
                  placeholder="Describe el teatro, sus instalaciones, estacionamiento, etc."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
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

      {/* Create Layout Modal */}
      {layoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setLayoutModalOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border p-6 shadow-xl"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Nueva Sala
              </h2>
              <button onClick={() => setLayoutModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre de la Sala</label>
                <input
                  type="text"
                  placeholder="ej. Sala Principal, VIP"
                  value={layoutForm.name}
                  onChange={(e) => setLayoutForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ancho (px)</label>
                  <input
                    type="number"
                    placeholder="800"
                    value={layoutForm.canvasWidth}
                    onChange={(e) => setLayoutForm((f) => ({ ...f, canvasWidth: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Alto (px)</label>
                  <input
                    type="number"
                    placeholder="600"
                    value={layoutForm.canvasHeight}
                    onChange={(e) => setLayoutForm((f) => ({ ...f, canvasHeight: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descripcion</label>
                <input
                  type="text"
                  placeholder="ej. Sala principal con pantalla IMAX"
                  value={layoutForm.description}
                  onChange={(e) => setLayoutForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setLayoutModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateLayout}
                disabled={saving || !layoutForm.name}
                className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                {saving ? 'Creando...' : 'Crear y Editar Asientos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salas Panel */}
      {salasOpen && salasTheater && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSalasOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Salas — {salasTheater.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {salasTheater.layouts?.length || 0} sala{(salasTheater.layouts?.length || 0) !== 1 ? 's' : ''} configurada{(salasTheater.layouts?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={() => setSalasOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>

            {/* Room cards */}
            <div className="space-y-3 mb-4">
              {salasTheater.layouts && salasTheater.layouts.length > 0 ? (
                salasTheater.layouts.map((layout) => (
                  <div
                    key={layout.id}
                    className="rounded-xl border p-4"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: 'var(--primary-container)' }}
                        >
                          <LayoutGrid className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{layout.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {salasLayoutSeats[layout.id]
                              ? `${salasLayoutSeats[layout.id].total} asientos${salasLayoutSeats[layout.id].disabled > 0 ? ` (${salasLayoutSeats[layout.id].disabled} deshabilitados)` : ''}`
                              : 'Cargando...'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Section breakdown */}
                    {salasLayoutSeats[layout.id] && Object.keys(salasLayoutSeats[layout.id].sections).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(salasLayoutSeats[layout.id].sections).map(([secName, sec]) => (
                          <span
                            key={secName}
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
                          >
                            {secName}: {sec.count} {sec.price ? `• $${sec.price}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSalasOpen(false);
                        openEditor(salasTheater, layout);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium mt-2"
                      style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar Asientos
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <LayoutGrid className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay salas configuradas</p>
                  <p className="text-xs">Crea una sala para empezar a agregar asientos</p>
                </div>
              )}
            </div>

            {/* Add new room */}
            <button
              onClick={() => {
                setSalasOpen(false);
                openCreateLayout(salasTheater.id);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-sm font-medium transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
            >
              <Plus className="h-4 w-4" /> Crear Nueva Sala
            </button>
          </div>
        </div>
      )}

      {/* Events Panel */}
      {eventsOpen && eventsTheater && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEventsOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border p-6 shadow-xl max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Eventos — {eventsTheater.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {theaterEventsList.length} evento{theaterEventsList.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEventForm({ title: '', description: '', category: 'cultural', date: '', time: '20:00', price: 0, capacity: eventsTheater.capacity || 0, imageUrl: '', layoutId: eventsTheater.layouts?.[0]?.id || '', seatingMode: 'numbered' });
                    setEventFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                >
                  <Plus className="h-3.5 w-3.5" /> Crear Evento
                </button>
                <button onClick={() => setEventsOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Event list */}
            <div className="space-y-2">
              {theaterEventsList.length > 0 ? theaterEventsList.map((ev: any) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}
                >
                  {ev.imageUrl && (
                    <img src={ev.imageUrl} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <CalendarDays className="h-3 w-3" />
                        {ev.date ? new Date(ev.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '-'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="h-3 w-3" /> {ev.time || '-'}
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--primary)' }}>
                        ${ev.price}
                      </span>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
                    style={{
                      backgroundColor: ev.status === 'active' ? 'var(--success-container)' : 'var(--surface)',
                      color: ev.status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    {ev.status}
                  </span>
                </div>
              )) : (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay eventos para este teatro</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Theater Event Modal */}
      {eventFormOpen && eventsTheater && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setEventFormOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Nuevo Evento — {eventsTheater.name}
              </h2>
              <button onClick={() => setEventFormOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Titulo</label>
                <input type="text" placeholder="ej. Hamlet — Noche de estreno"
                  value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descripcion</label>
                <textarea placeholder="Describe el evento, artistas, lo que incluye..."
                  value={eventForm.description} onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                  <select value={eventForm.category} onChange={(e) => setEventForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <option value="cultural">Cultural</option>
                    <option value="conciertos">Conciertos</option>
                    <option value="vida_nocturna">Vida Nocturna</option>
                    <option value="familiar">Familiar</option>
                    <option value="conferencias">Conferencias</option>
                    <option value="deportes">Deportes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Modo de Asientos</label>
                  <select value={eventForm.seatingMode} onChange={(e) => setEventForm((f) => ({ ...f, seatingMode: e.target.value as any }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <option value="numbered">Numerado (usuario elige asiento)</option>
                    <option value="general">General (sin asiento asignado)</option>
                  </select>
                </div>
              </div>
              {eventForm.seatingMode === 'numbered' && eventsTheater.layouts && eventsTheater.layouts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Sala</label>
                  <select value={eventForm.layoutId} onChange={(e) => setEventForm((f) => ({ ...f, layoutId: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    {eventsTheater.layouts.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Los asientos se congelan al crear el evento. Cambios futuros al layout no afectan este evento.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha</label>
                  <input type="date" value={eventForm.date}
                    onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Hora</label>
                  <input type="time" value={eventForm.time}
                    onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Precio base</label>
                  <input type="number" placeholder="0.00" value={eventForm.price}
                    onChange={(e) => setEventForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <ImageUpload
                value={eventForm.imageUrl}
                onChange={(url) => setEventForm((f) => ({ ...f, imageUrl: url }))}
                folder="events"
                label="Imagen del Evento"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEventFormOpen(false)}
                className="rounded-xl border px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancelar
              </button>
              <button onClick={handleCreateTheaterEvent}
                disabled={saving || !eventForm.title || !eventForm.date}
                className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                {saving ? 'Creando...' : 'Crear Evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
