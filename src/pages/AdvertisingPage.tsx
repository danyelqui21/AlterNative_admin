import { useState, useEffect } from 'react';
import { useAdvertisingAdminViewModel } from '@/features/advertising/presentation/viewmodels/advertising-admin.viewmodel';
import { Shimmer } from '@/components/ui/Shimmer';
import {
  Megaphone,
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Layers,
  Plus,
  Pause,
  Play,
  Ban,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface AdStats {
  total: number;
  active: number;
  totalBudget: number;
  totalSpent: number;
  impressions: number;
  clicks: number;
}

interface AdCampaign {
  id: string;
  title: string;
  advertiser: string;
  placement: 'banner' | 'promo' | 'featured' | 'popup';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
}

interface AdsResponse {
  data: AdCampaign[];
  total: number;
  page: number;
  limit: number;
}

interface CampaignForm {
  title: string;
  advertiser: string;
  placement: string;
  budget: string;
  startDate: string;
  endDate: string;
}

const emptyForm: CampaignForm = {
  title: '',
  advertiser: '',
  placement: 'banner',
  budget: '',
  startDate: '',
  endDate: '',
};

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Activa', value: 'active' },
  { label: 'Pausada', value: 'paused' },
  { label: 'Completada', value: 'completed' },
  { label: 'Cancelada', value: 'cancelled' },
];

const placementOptions = [
  { label: 'Todos', value: '' },
  { label: 'Banner', value: 'banner' },
  { label: 'Promo', value: 'promo' },
  { label: 'Destacado', value: 'featured' },
  { label: 'Popup', value: 'popup' },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'var(--surface-variant)', text: 'var(--text-muted)' },
  active: { bg: 'var(--success-container)', text: 'var(--success)' },
  paused: { bg: 'var(--warning-container)', text: 'var(--warning)' },
  completed: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  cancelled: { bg: 'var(--error-container)', text: 'var(--error)' },
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const placementStyles: Record<string, { bg: string; text: string }> = {
  banner: { bg: 'var(--secondary-container)', text: 'var(--secondary)' },
  promo: { bg: 'var(--primary-container)', text: 'var(--primary)' },
  featured: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  popup: { bg: 'var(--warning-container)', text: 'var(--warning)' },
};

const placementLabels: Record<string, string> = {
  banner: 'Banner',
  promo: 'Promo',
  featured: 'Destacado',
  popup: 'Popup',
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

export default function AdvertisingPage() {
  const vm = useAdvertisingAdminViewModel();
  const ads = vm.ads as unknown as AdCampaign[];
  const loading = vm.isLoading;
  const total = ads.length;

  const stats: AdStats | null = {
    total: ads.length,
    active: vm.adsByStatus.active?.length ?? 0,
    totalBudget: 0,
    totalSpent: vm.totalSpent,
    impressions: vm.totalImpressions,
    clicks: vm.totalClicks,
  };

  const [statusFilter, setStatusFilter] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<AdCampaign | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setStatusFilter(statusFilter ? statusFilter as any : undefined); }, [statusFilter]);
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setPage(page); }, [page]);

  const handleAction = async (adId: string, action: 'activate' | 'pause' | 'cancel') => {
    try {
      await vm.updateAd.mutateAsync({ id: adId, params: { action } as any });
    } catch {
      /* ignore */
    }
  };

  const openCreateModal = () => {
    setEditingAd(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (ad: AdCampaign) => {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      advertiser: ad.advertiser,
      placement: ad.placement,
      budget: String(ad.budget),
      startDate: ad.startDate.slice(0, 10),
      endDate: ad.endDate.slice(0, 10),
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        advertiser: form.advertiser,
        placement: form.placement,
        budget: parseFloat(form.budget) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      if (editingAd) {
        await vm.updateAd.mutateAsync({ id: editingAd.id, params: payload as any });
      } else {
        await vm.createAd.mutateAsync(payload as any);
      }
      setShowModal(false);
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statsCards = stats
    ? [
        { label: 'Total campanas', value: stats.total.toLocaleString('es-MX'), icon: Layers, color: 'var(--primary)' },
        { label: 'Activas', value: stats.active.toLocaleString('es-MX'), icon: Megaphone, color: 'var(--success)' },
        { label: 'Presupuesto total', value: formatCurrency(stats.totalBudget), icon: DollarSign, color: 'var(--secondary)' },
        { label: 'Gastado total', value: formatCurrency(stats.totalSpent), icon: DollarSign, color: 'var(--warning)' },
        { label: 'Impresiones', value: stats.impressions.toLocaleString('es-MX'), icon: Eye, color: 'var(--accent)' },
        { label: 'Clics', value: stats.clicks.toLocaleString('es-MX'), icon: MousePointerClick, color: 'var(--primary)' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="h-8 w-8" style={{ color: 'var(--primary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Campanas Publicitarias
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="h-4 w-4" />
          Nueva Campana
        </button>
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
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Ubicacion</label>
          <select
            value={placementFilter}
            onChange={(e) => { setPlacementFilter(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              backgroundColor: 'var(--surface-container)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {placementOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Buscar</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar campana..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="rounded-lg border py-2 pl-8 pr-3 text-sm"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
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
                {['Titulo', 'Anunciante', 'Ubicacion', 'Presupuesto', 'Gastado', 'Impresiones', 'Clics', 'CTR', 'Estado', 'Rango fechas', 'Acciones'].map(
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
                      {Array.from({ length: 11 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Shimmer className="h-5 rounded" style={{ width: `${50 + (j * 9) % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No se encontraron campanas</p>
                  </td>
                </tr>
              ) : (
                ads.map((ad) => {
                  const st = statusStyles[ad.status] ?? { bg: 'var(--surface-variant)', text: 'var(--text-muted)' };
                  const pl = placementStyles[ad.placement] ?? { bg: 'var(--surface-variant)', text: 'var(--text-muted)' };
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
                  return (
                    <tr
                      key={ad.id}
                      className="border-t"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {ad.title}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {ad.advertiser}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: pl.bg, color: pl.text }}
                        >
                          {placementLabels[ad.placement] ?? ad.placement}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(ad.budget)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(ad.spent)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {ad.impressions.toLocaleString('es-MX')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {ad.clicks.toLocaleString('es-MX')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                          <TrendingUp className="h-3.5 w-3.5" />
                          {ctr}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.text }}
                        >
                          {statusLabels[ad.status] ?? ad.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(ad.status === 'draft' || ad.status === 'paused') && (
                            <button
                              onClick={() => handleAction(ad.id, 'activate')}
                              className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                              style={{ color: 'var(--success)' }}
                              title="Activar"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {ad.status === 'active' && (
                            <button
                              onClick={() => handleAction(ad.id, 'pause')}
                              className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                              style={{ color: 'var(--warning)' }}
                              title="Pausar"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          )}
                          {ad.status !== 'cancelled' && ad.status !== 'completed' && (
                            <button
                              onClick={() => handleAction(ad.id, 'cancel')}
                              className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                              style={{ color: 'var(--error)' }}
                              title="Cancelar"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          {ad.status !== 'completed' && ad.status !== 'cancelled' && (
                            <button
                              onClick={() => openEditModal(ad)}
                              className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                              style={{ color: 'var(--text-muted)' }}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-lg rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingAd ? 'Editar Campana' : 'Nueva Campana'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Titulo</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    backgroundColor: 'var(--surface-container)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Anunciante</label>
                <input
                  type="text"
                  value={form.advertiser}
                  onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    backgroundColor: 'var(--surface-container)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ubicacion</label>
                  <select
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: 'var(--surface-container)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="banner">Banner</option>
                    <option value="promo">Promo</option>
                    <option value="featured">Destacado</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Presupuesto (MXN)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: 'var(--surface-container)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Fecha inicio</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: 'var(--surface-container)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Fecha fin</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: 'var(--surface-container)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.title || !form.advertiser}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {submitting ? 'Guardando...' : editingAd ? 'Guardar cambios' : 'Crear campana'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
