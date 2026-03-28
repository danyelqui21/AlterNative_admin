import { useState, useEffect } from 'react';
import { useModerationAdminViewModel } from '@/features/moderation/presentation/viewmodels/moderation-admin.viewmodel';
import { ShimmerTable } from '@/components/ui/Shimmer';

interface ModerationReport {
  id: string;
  type: string;
  targetName: string;
  targetId: string;
  reason: string;
  reporter: string;
  reporterId: string;
  details: string;
  createdAt: string;
  status: string;
  resolution: string;
}

interface ModerationStats {
  pending: number;
  reviewed: number;
  resolved: number;
  dismissed: number;
}

interface PaginatedResponse {
  data: ModerationReport[];
  total: number;
  page: number;
  pageSize: number;
}

const typeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'comment', label: 'Comentario' },
  { value: 'chat', label: 'Chat' },
  { value: 'user', label: 'Usuario' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'review', label: 'Resena' },
  { value: 'event', label: 'Evento' },
];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'reviewed', label: 'Revisado' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'dismissed', label: 'Descartado' },
];

const typeLabelMap: Record<string, string> = {
  comment: 'Comentario',
  chat: 'Chat',
  user: 'Usuario',
  restaurant: 'Restaurante',
  review: 'Resena',
  event: 'Evento',
};

const typeColorMap: Record<string, string> = {
  comment: 'var(--accent)',
  chat: 'var(--secondary)',
  user: 'var(--warning)',
  restaurant: 'var(--primary)',
  review: 'var(--success)',
  event: 'var(--error)',
};

const statusLabelMap: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
};

const statusColorMap: Record<string, string> = {
  pending: 'var(--warning)',
  reviewed: 'var(--accent)',
  resolved: 'var(--success)',
  dismissed: 'var(--text-muted)',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ModerationPage() {
  const vm = useModerationAdminViewModel();
  const reports = vm.reports as unknown as ModerationReport[];
  const loading = vm.isLoading;
  const total = reports.length;
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const stats: ModerationStats = {
    pending: vm.reportsByStatus.pending?.length ?? 0,
    reviewed: vm.reportsByStatus.reviewed?.length ?? 0,
    resolved: vm.reportsByStatus.resolved?.length ?? 0,
    dismissed: vm.reportsByStatus.dismissed?.length ?? 0,
  };

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Review modal
  const [reviewModal, setReviewModal] = useState<ModerationReport | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sync filters to viewmodel
  useEffect(() => { vm.setTypeFilter(typeFilter ? typeFilter as any : undefined); }, [typeFilter]);
  useEffect(() => { vm.setStatusFilter(statusFilter ? statusFilter as any : undefined); }, [statusFilter]);
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setPage(page); }, [page]);
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function updateStatus(reportId: string, newStatus: string, resolutionText?: string) {
    setActionLoading(reportId);
    try {
      await vm.resolveReport.mutateAsync({
        id: reportId,
        status: newStatus as any,
        resolution: resolutionText,
      } as any);
      setReviewModal(null);
      setResolution('');
    } finally {
      setActionLoading(null);
    }
  }

  const statCards = [
    { label: 'Pendientes', value: stats.pending, color: 'var(--warning)' },
    { label: 'Revisados', value: stats.reviewed, color: 'var(--accent)' },
    { label: 'Resueltos', value: stats.resolved, color: 'var(--success)' },
    { label: 'Descartados', value: stats.dismissed, color: 'var(--text-muted)' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Moderacion de Contenido
      </h1>

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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por contenido o reportante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border text-sm outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <ShimmerTable rows={8} cols={6} />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No hay reportes</p>
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
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Contenido</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Reportado por</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Razon</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Estado</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t transition-colors hover:brightness-110"
                    style={{
                      backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: typeColorMap[item.type] ?? 'var(--text-muted)', color: '#fff' }}
                      >
                        {typeLabelMap[item.type] ?? item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[220px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.targetName}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {item.reporter}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }} title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusColorMap[item.status] ?? 'var(--text-muted)', color: '#fff' }}
                      >
                        {statusLabelMap[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => { setReviewModal(item); setResolution(item.resolution ?? ''); }}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                          style={{ backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}
                        >
                          Revisar
                        </button>
                        {item.status !== 'resolved' && (
                          <button
                            onClick={() => updateStatus(item.id, 'resolved')}
                            disabled={actionLoading === item.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--success)', color: '#fff', borderColor: 'var(--success)' }}
                          >
                            Resolver
                          </button>
                        )}
                        {item.status !== 'dismissed' && (
                          <button
                            onClick={() => updateStatus(item.id, 'dismissed')}
                            disabled={actionLoading === item.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                          >
                            Descartar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="rounded-2xl p-6 w-full max-w-lg space-y-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Revisar Reporte</h2>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tipo</p>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: typeColorMap[reviewModal.type] ?? 'var(--text-muted)', color: '#fff' }}
                  >
                    {typeLabelMap[reviewModal.type] ?? reviewModal.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Estado</p>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusColorMap[reviewModal.status] ?? 'var(--text-muted)', color: '#fff' }}
                  >
                    {statusLabelMap[reviewModal.status] ?? reviewModal.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Contenido reportado</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{reviewModal.targetName}</p>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Reportado por</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{reviewModal.reporter}</p>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Razon</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{reviewModal.reason}</p>
              </div>

              {reviewModal.details && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Detalles</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{reviewModal.details}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Fecha</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(reviewModal.createdAt)}</p>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Resolucion</p>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Escribe una resolucion o nota..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setReviewModal(null); setResolution(''); }}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => updateStatus(reviewModal.id, 'dismissed', resolution)}
                disabled={actionLoading === reviewModal.id}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >
                Descartar
              </button>
              <button
                onClick={() => updateStatus(reviewModal.id, 'reviewed', resolution)}
                disabled={actionLoading === reviewModal.id}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                Marcar Revisado
              </button>
              <button
                onClick={() => updateStatus(reviewModal.id, 'resolved', resolution)}
                disabled={actionLoading === reviewModal.id}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--success)', color: '#fff' }}
              >
                Resolver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
