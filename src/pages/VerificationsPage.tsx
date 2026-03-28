import { useState, useEffect } from 'react';
import { useVerificationsAdminViewModel } from '@/features/verifications/presentation/viewmodels/verifications-admin.viewmodel';
import { Shimmer } from '@/components/ui/Shimmer';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search as SearchIcon,
  Eye,
  FileText,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';

interface VerificationStats {
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  byType: {
    identity: number;
    organizer: number;
    restaurant: number;
  };
}

interface VerificationItem {
  id: string;
  userName: string;
  userId: string;
  type: 'identity' | 'organizer' | 'restaurant';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  documentsCount: number;
  notes: string;
  createdAt: string;
}

interface VerificationsResponse {
  data: VerificationItem[];
  total: number;
  page: number;
  limit: number;
}

const typeOptions = [
  { label: 'Todos', value: '' },
  { label: 'Identidad', value: 'identity' },
  { label: 'Organizador', value: 'organizer' },
  { label: 'Restaurante', value: 'restaurant' },
];

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'En revision', value: 'in_review' },
  { label: 'Aprobado', value: 'approved' },
  { label: 'Rechazado', value: 'rejected' },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'var(--warning-container)', text: 'var(--warning)' },
  in_review: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  approved: { bg: 'var(--success-container)', text: 'var(--success)' },
  rejected: { bg: 'var(--error-container)', text: 'var(--error)' },
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revision',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const typeStyles: Record<string, { bg: string; text: string }> = {
  identity: { bg: 'var(--primary-container)', text: 'var(--primary)' },
  organizer: { bg: 'var(--secondary-container)', text: 'var(--secondary)' },
  restaurant: { bg: 'var(--accent-container)', text: 'var(--accent)' },
};

const typeLabels: Record<string, string> = {
  identity: 'Identidad',
  organizer: 'Organizador',
  restaurant: 'Restaurante',
};

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

export default function VerificationsPage() {
  const vm = useVerificationsAdminViewModel();
  const verifications = vm.verifications as unknown as VerificationItem[];
  const loading = vm.isLoading;
  const total = verifications.length;

  const stats: VerificationStats | null = {
    total: verifications.length,
    pending: vm.pendingCount,
    approved: vm.byStatus.approved?.length ?? 0,
    rejected: vm.byStatus.rejected?.length ?? 0,
  };

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<VerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setTypeFilter(typeFilter ? typeFilter as any : undefined); }, [typeFilter]);
  useEffect(() => { vm.setStatusFilter(statusFilter ? statusFilter as any : undefined); }, [statusFilter]);
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setPage(page); }, [page]);
  const handleApprove = async (id: string) => {
    try {
      await vm.reviewVerification.mutateAsync({ id, status: 'approved' } as any);
    } catch {
      /* ignore */
    }
  };

  const handleMarkInReview = async (id: string) => {
    try {
      await vm.reviewVerification.mutateAsync({ id, status: 'in-review' } as any);
    } catch {
      /* ignore */
    }
  };

  const openRejectModal = (v: VerificationItem) => {
    setRejectTarget(v);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setSubmitting(true);
    try {
      await vm.reviewVerification.mutateAsync({ id: rejectTarget.id, status: 'rejected', reason: rejectReason } as any);
      setShowRejectModal(false);
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDocuments = (id: string) => {
    window.open(`/admin/verifications/${id}/documents`, '_blank');
  };

  const totalPages = Math.ceil(total / limit);

  const statsCards = stats
    ? [
        { label: 'Pendientes', value: stats.pending.toLocaleString('es-MX'), icon: Clock, color: 'var(--warning)' },
        { label: 'En revision', value: stats.inReview.toLocaleString('es-MX'), icon: Eye, color: 'var(--accent)' },
        { label: 'Aprobados', value: stats.approved.toLocaleString('es-MX'), icon: CheckCircle, color: 'var(--success)' },
        { label: 'Rechazados', value: stats.rejected.toLocaleString('es-MX'), icon: XCircle, color: 'var(--error)' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8" style={{ color: 'var(--primary)' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Verificaciones
        </h1>
      </div>

      {/* Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card) => {
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

          {/* By Type breakdown */}
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Por tipo
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Identidad', count: stats.byType.identity, color: 'var(--primary)' },
                { label: 'Organizador', count: stats.byType.organizer, color: 'var(--secondary)' },
                { label: 'Restaurante', count: stats.byType.restaurant, color: 'var(--accent)' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.label}: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div
        className="flex flex-wrap items-end gap-3 rounded-2xl border p-4"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              backgroundColor: 'var(--surface-container)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

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
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Buscar</label>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
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
                {['Nombre', 'Tipo', 'Estado', 'Documentos', 'Notas', 'Creado', 'Acciones'].map(
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
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Shimmer className="h-5 rounded" style={{ width: `${50 + (j * 11) % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No se encontraron verificaciones</p>
                  </td>
                </tr>
              ) : (
                verifications.map((v) => {
                  const st = statusStyles[v.status] ?? { bg: 'var(--surface-variant)', text: 'var(--text-muted)' };
                  const tt = typeStyles[v.type] ?? { bg: 'var(--surface-variant)', text: 'var(--text-muted)' };
                  const isPending = v.status === 'pending';
                  const isInReview = v.status === 'in_review';
                  return (
                    <tr
                      key={v.id}
                      className="border-t"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: isPending ? 'var(--warning-container)' : undefined,
                      }}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {v.userName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: tt.bg, color: tt.text }}
                        >
                          {typeLabels[v.type] ?? v.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.text }}
                        >
                          {statusLabels[v.status] ?? v.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          onClick={() => handleViewDocuments(v.id)}
                          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                          style={{ color: 'var(--accent)' }}
                        >
                          <FileText className="h-4 w-4" />
                          {v.documentsCount} doc{v.documentsCount !== 1 ? 's' : ''}
                        </button>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {v.notes ? truncate(v.notes, 40) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(v.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(isPending || isInReview) && (
                            <>
                              <button
                                onClick={() => handleApprove(v.id)}
                                className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                                style={{ color: 'var(--success)' }}
                                title="Aprobar"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openRejectModal(v)}
                                className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                                style={{ color: 'var(--error)' }}
                                title="Rechazar"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {isPending && (
                            <button
                              onClick={() => handleMarkInReview(v.id)}
                              className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                              style={{ color: 'var(--accent)' }}
                              title="Marcar en revision"
                            >
                              <AlertCircle className="h-4 w-4" />
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

      {/* Reject Modal */}
      {showRejectModal && rejectTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Rechazar verificacion
              </h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg p-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Rechazar la verificacion de <span className="font-bold">{rejectTarget.userName}</span> ({typeLabels[rejectTarget.type]})
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Razon del rechazo
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explica la razon del rechazo..."
                rows={4}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--surface-container)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--error)' }}
              >
                {submitting ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
