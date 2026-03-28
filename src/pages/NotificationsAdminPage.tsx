import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/core/api/api-client';
import { Shimmer, ShimmerText, ShimmerTable } from '@/components/ui/Shimmer';
import {
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Clock,
  Eye,
} from 'lucide-react';

/* ---------- types ---------- */
type NotificationType = 'dialog' | 'push' | 'both';
type NotificationPriority = 'normal' | 'high' | 'critical';
type TargetType = 'all' | 'role' | 'user' | 'app';

interface NotificationForm {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetType: TargetType;
  targetValue: string;
  targetApps: string[];
  actionUrl: string;
  actionLabel: string;
  scheduledAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetType: TargetType;
  targetValue: string;
  targetApps: string[];
  actionUrl?: string;
  actionLabel?: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  readCount: number;
  createdAt: string;
}

/* ---------- constants ---------- */
const PAGE_SIZE = 10;

const ALL_APPS = [
  { value: 'app.user', label: 'LagunApp User' },
  { value: 'app.web', label: 'LagunApp Web' },
  { value: 'app.admin', label: 'LagunApp Admin' },
  { value: 'app.organizer', label: 'LagunApp Organizer' },
  { value: 'app.restaurant', label: 'LagunApp Restaurant' },
  { value: 'app.scanner', label: 'LagunApp Scanner' },
];

const ROLES = ['User', 'Organizer', 'Restaurant', 'Scanner Staff', 'Admin'];

const defaultForm: NotificationForm = {
  title: '',
  message: '',
  type: 'both',
  priority: 'normal',
  targetType: 'all',
  targetValue: '',
  targetApps: ['app.user', 'app.web'],
  actionUrl: '',
  actionLabel: '',
  scheduledAt: '',
};

/* ---------- helpers ---------- */
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function typeBadge(type: NotificationType) {
  const map: Record<NotificationType, { bg: string; color: string; label: string }> = {
    dialog: { bg: 'var(--accent-container)', color: 'var(--accent)', label: 'Dialog' },
    push: { bg: 'var(--success-container)', color: 'var(--success)', label: 'Push' },
    both: { bg: 'var(--secondary-container)', color: 'var(--secondary)', label: 'Ambos' },
  };
  return map[type];
}

function priorityBadge(priority: NotificationPriority) {
  const map: Record<NotificationPriority, { bg: string; color: string; label: string }> = {
    normal: { bg: 'var(--surface-variant)', color: 'var(--text-secondary)', label: 'Normal' },
    high: { bg: 'var(--warning-container)', color: 'var(--warning)', label: 'Alta' },
    critical: { bg: 'var(--error-container)', color: 'var(--error)', label: 'Critica' },
  };
  return map[priority];
}

function targetLabel(targetType: TargetType, targetValue: string): string {
  switch (targetType) {
    case 'all': return 'Todos';
    case 'role': return `Rol: ${targetValue}`;
    case 'user': return 'Usuario';
    case 'app': return 'App';
    default: return targetType;
  }
}

/* ---------- component ---------- */
export default function NotificationsAdminPage() {
  // --- Form state ---
  const [form, setForm] = useState<NotificationForm>({ ...defaultForm });
  const [scheduleMode, setScheduleMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- History state ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // --- Filters ---
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // --- Detail modal ---
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // --- Fetch notifications ---
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (filterType) params.type = filterType;
      if (filterPriority) params.priority = filterPriority;
      if (filterSearch) params.search = filterSearch;

      const res = await apiClient.get('/admin/notifications', { params });
      const data = res.data;
      setNotifications(data.items || data.data || []);
      setTotalCount(data.total || data.count || 0);
    } catch {
      setNotifications([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterPriority, filterSearch]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Clear toast after 5s
  useEffect(() => {
    if (sendResult) {
      const timer = setTimeout(() => setSendResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [sendResult]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // --- Send notification ---
  async function handleSend() {
    setSending(true);
    setSendResult(null);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        message: form.message,
        type: form.type,
        priority: form.priority,
        targetType: form.targetType,
        targetValue: form.targetValue || undefined,
        targetApps: form.targetApps,
      };
      if (form.actionUrl) payload.actionUrl = form.actionUrl;
      if (form.actionLabel) payload.actionLabel = form.actionLabel;
      if (scheduleMode && form.scheduledAt) {
        payload.scheduledAt = new Date(form.scheduledAt).toISOString();
      }

      const res = await apiClient.post('/admin/notifications', payload);
      const count = res.data?.recipientCount ?? res.data?.recipients ?? '?';

      if (scheduleMode && form.scheduledAt) {
        // Schedule via PUT endpoint
        if (res.data?.id) {
          await apiClient.put(`/admin/notifications/${res.data.id}/schedule`, {
            scheduledAt: new Date(form.scheduledAt).toISOString(),
          });
        }
      }

      setSendResult({
        type: 'success',
        message: scheduleMode
          ? `Notificacion programada para ${formatDate(form.scheduledAt)}`
          : `Notificacion enviada a ${count} usuarios`,
      });
      setForm({ ...defaultForm });
      setScheduleMode(false);
      fetchNotifications();
    } catch (err: any) {
      setSendResult({
        type: 'error',
        message: err?.response?.data?.message || 'Error al enviar la notificacion',
      });
    } finally {
      setSending(false);
    }
  }

  // --- View detail ---
  async function handleViewDetail(notification: Notification) {
    try {
      const res = await apiClient.get(`/admin/notifications/${notification.id}`);
      setSelectedNotification(res.data);
    } catch {
      setSelectedNotification(notification);
    }
  }

  // --- Toggle button helper ---
  function ToggleGroup<T extends string>({
    options,
    value,
    onChange,
  }: {
    options: { value: T; label: string; activeColor?: string; activeBg?: string }[];
    value: T;
    onChange: (v: T) => void;
  }) {
    return (
      <div className="flex gap-1">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              style={
                active
                  ? {
                      backgroundColor: opt.activeBg || 'var(--primary-container)',
                      color: opt.activeColor || 'var(--primary)',
                    }
                  : {
                      backgroundColor: 'var(--surface-variant)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  // --- Badge helper ---
  function Badge({ bg, color, label }: { bg: string; color: string; label: string }) {
    return (
      <span
        className="rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
        style={{ backgroundColor: bg, color }}
      >
        {label}
      </span>
    );
  }

  const inputStyle = {
    backgroundColor: 'var(--surface-variant)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="h-7 w-7" style={{ color: 'var(--primary)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Notificaciones
        </h1>
      </div>

      {/* Toast */}
      {sendResult && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: sendResult.type === 'success' ? 'var(--success-container)' : 'var(--error-container)',
            color: sendResult.type === 'success' ? 'var(--success)' : 'var(--error)',
          }}
        >
          {sendResult.message}
        </div>
      )}

      {/* ===== Section 1: Send Notification ===== */}
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Enviar Notificacion
        </h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Titulo *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Titulo de la notificacion"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Mensaje *
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Contenido de la notificacion"
            rows={4}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-y"
            style={inputStyle}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Tipo
          </label>
          <ToggleGroup
            options={[
              { value: 'dialog' as NotificationType, label: 'Dialog' },
              { value: 'push' as NotificationType, label: 'Push' },
              { value: 'both' as NotificationType, label: 'Ambos' },
            ]}
            value={form.type}
            onChange={(v) => setForm((f) => ({ ...f, type: v }))}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Prioridad
          </label>
          <ToggleGroup
            options={[
              { value: 'normal' as NotificationPriority, label: 'Normal' },
              {
                value: 'high' as NotificationPriority,
                label: 'Alta',
                activeColor: 'var(--warning)',
                activeBg: 'var(--warning-container)',
              },
              {
                value: 'critical' as NotificationPriority,
                label: 'Critica',
                activeColor: 'var(--error)',
                activeBg: 'var(--error-container)',
              },
            ]}
            value={form.priority}
            onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
          />
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Destino
          </label>
          <select
            value={form.targetType}
            onChange={(e) =>
              setForm((f) => ({ ...f, targetType: e.target.value as TargetType, targetValue: '' }))
            }
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            style={inputStyle}
          >
            <option value="all">Todos los usuarios</option>
            <option value="role">Por rol</option>
            <option value="user">Usuario especifico</option>
            <option value="app">Por aplicacion</option>
          </select>

          {/* Role sub-dropdown */}
          {form.targetType === 'role' && (
            <select
              value={form.targetValue}
              onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
              className="mt-2 rounded-xl border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Seleccionar rol</option>
              {ROLES.map((r) => (
                <option key={r} value={r.toLowerCase()}>
                  {r}
                </option>
              ))}
            </select>
          )}

          {/* User ID input */}
          {form.targetType === 'user' && (
            <input
              type="text"
              value={form.targetValue}
              onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
              placeholder="IDs de usuario separados por coma"
              className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          )}
        </div>

        {/* Target Apps */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Aplicaciones destino
          </label>
          <div className="flex flex-wrap gap-3">
            {ALL_APPS.map((app) => {
              const checked = form.targetApps.includes(app.value);
              return (
                <label
                  key={app.value}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setForm((f) => ({
                        ...f,
                        targetApps: checked
                          ? f.targetApps.filter((a) => a !== app.value)
                          : [...f.targetApps, app.value],
                      }));
                    }}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {app.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action URL + Label */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Action URL
            </label>
            <input
              type="text"
              value={form.actionUrl}
              onChange={(e) => setForm((f) => ({ ...f, actionUrl: e.target.value }))}
              placeholder="URL a abrir al tocar la notificacion"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Action Label
            </label>
            <input
              type="text"
              value={form.actionLabel}
              onChange={(e) => setForm((f) => ({ ...f, actionLabel: e.target.value }))}
              placeholder="Texto del boton (ej: Ver evento)"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Schedule toggle */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Envio
          </label>
          <div className="flex items-center gap-4">
            <ToggleGroup
              options={[
                { value: 'now', label: 'Enviar ahora' },
                { value: 'schedule', label: 'Programar' },
              ]}
              value={scheduleMode ? 'schedule' : 'now'}
              onChange={(v) => {
                setScheduleMode(v === 'schedule');
                if (v === 'now') setForm((f) => ({ ...f, scheduledAt: '' }));
              }}
            />
            {scheduleMode && (
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            )}
          </div>
        </div>

        {/* Send button */}
        <div className="pt-2">
          {sending ? (
            <Shimmer className="h-10 w-52 rounded-xl" />
          ) : (
            <button
              onClick={handleSend}
              disabled={!form.title || !form.message || (scheduleMode && !form.scheduledAt)}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
            >
              {scheduleMode ? (
                <>
                  <Clock className="h-4 w-4" /> Programar Notificacion
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Enviar Notificacion
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ===== Section 2: Notification History ===== */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Historial de Notificaciones
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Buscar por titulo..."
              value={filterSearch}
              onChange={(e) => {
                setFilterSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Tipo: Todos</option>
            <option value="dialog">Dialog</option>
            <option value="push">Push</option>
            <option value="both">Ambos</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => {
              setFilterPriority(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Prioridad: Todas</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="critical">Critica</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <ShimmerTable rows={6} cols={7} />
          </div>
        ) : (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-container)' }}>
                  {['Titulo', 'Tipo', 'Prioridad', 'Destino', 'Enviado', 'Destinatarios', 'Leido', 'Acciones'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {notifications.map((n, idx) => {
                  const tb = typeBadge(n.type);
                  const pb = priorityBadge(n.priority);
                  const readPct = n.recipientCount > 0 ? Math.round((n.readCount / n.recipientCount) * 100) : 0;

                  return (
                    <tr
                      key={n.id}
                      className="border-t transition-colors cursor-pointer hover:brightness-110"
                      style={{
                        backgroundColor:
                          idx % 2 === 0
                            ? 'var(--surface)'
                            : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                        borderColor: 'var(--border)',
                      }}
                      onClick={() => handleViewDetail(n)}
                    >
                      <td
                        className="px-4 py-3 max-w-[200px] truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {n.title}
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg={tb.bg} color={tb.color} label={tb.label} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg={pb.bg} color={pb.color} label={pb.label} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          bg="var(--surface-variant)"
                          color="var(--text-secondary)"
                          label={targetLabel(n.targetType, n.targetValue)}
                        />
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(n.sentAt || n.createdAt)}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                        {n.recipientCount.toLocaleString('es-MX')}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {n.readCount.toLocaleString('es-MX')} ({readPct}%)
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(n);
                          }}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--primary-container)',
                            color: 'var(--primary)',
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Ver
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {notifications.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      No se encontraron notificaciones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Mostrando {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalCount)} de{' '}
              {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border p-2 disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
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
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Detail Modal ===== */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Detalle de Notificacion
              </h2>
              <button
                onClick={() => setSelectedNotification(null)}
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Titulo
                </p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {selectedNotification.title}
                </p>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Mensaje
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {selectedNotification.message}
                </p>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const tb = typeBadge(selectedNotification.type);
                  return <Badge bg={tb.bg} color={tb.color} label={tb.label} />;
                })()}
                {(() => {
                  const pb = priorityBadge(selectedNotification.priority);
                  return <Badge bg={pb.bg} color={pb.color} label={pb.label} />;
                })()}
                <Badge
                  bg="var(--surface-variant)"
                  color="var(--text-secondary)"
                  label={targetLabel(selectedNotification.targetType, selectedNotification.targetValue)}
                />
              </div>

              {/* Stats */}
              <div
                className="grid grid-cols-3 gap-4 rounded-xl p-4"
                style={{ backgroundColor: 'var(--surface-variant)' }}
              >
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                    {selectedNotification.recipientCount.toLocaleString('es-MX')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Enviados
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                    {selectedNotification.readCount.toLocaleString('es-MX')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Leidos
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>
                    {selectedNotification.recipientCount > 0
                      ? Math.round(
                          (selectedNotification.readCount / selectedNotification.recipientCount) * 100,
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Tasa de lectura
                  </p>
                </div>
              </div>

              {/* Target Apps */}
              <div>
                <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  Aplicaciones destino
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedNotification.targetApps || []).map((app) => {
                    const appInfo = ALL_APPS.find((a) => a.value === app);
                    return (
                      <Badge
                        key={app}
                        bg="var(--accent-container)"
                        color="var(--accent)"
                        label={appInfo?.label || app}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Action URL */}
              {selectedNotification.actionUrl && (
                <div>
                  <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                    Action URL
                  </p>
                  <p className="text-sm font-mono" style={{ color: 'var(--accent)' }}>
                    {selectedNotification.actionUrl}
                  </p>
                  {selectedNotification.actionLabel && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Label: {selectedNotification.actionLabel}
                    </p>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                    Enviado
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(selectedNotification.sentAt || selectedNotification.createdAt)}
                  </p>
                </div>
                {selectedNotification.scheduledAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                      Programado
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(selectedNotification.scheduledAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedNotification(null)}
                className="rounded-xl border px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
