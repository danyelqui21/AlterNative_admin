import { useState, useEffect } from 'react';
import { useBlogAdminViewModel } from '@/features/blog/presentation/viewmodels/blog-admin.viewmodel';
import { Shimmer, ShimmerTable } from '@/components/ui/Shimmer';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  FileText,
  Search,
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Archive,
  FileEdit,
} from 'lucide-react';

/* ---------- types ---------- */
interface BlogPost {
  id: string;
  title: string;
  authorName: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
}

interface BlogForm {
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  tags: string;
  authorName: string;
}

/* ---------- constants ---------- */
const PAGE_SIZE = 10;

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  published: { bg: 'var(--success-container)', text: 'var(--success)', label: 'Publicado' },
  draft: { bg: 'var(--warning-container)', text: 'var(--warning)', label: 'Borrador' },
  archived: { bg: 'var(--surface-variant)', text: 'var(--text-muted)', label: 'Archivado' },
};

const defaultForm: BlogForm = {
  title: '',
  content: '',
  excerpt: '',
  imageUrl: '',
  tags: '',
  authorName: '',
};

/* ---------- helpers ---------- */
function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------- component ---------- */
export default function BlogAdminPage() {
  const vm = useBlogAdminViewModel();
  const posts = vm.posts as unknown as BlogPost[];
  const loading = vm.isLoading;

  // filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // pagination
  const [page, setPage] = useState(1);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setStatusFilter(statusFilter ? statusFilter as any : undefined); }, [statusFilter]);
  useEffect(() => { vm.setPage(page); }, [page]);

  /* filter */
  const filtered = posts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* status change */
  async function handleStatusChange(post: BlogPost, newStatus: 'draft' | 'published' | 'archived') {
    try {
      await vm.updatePost.mutateAsync({ id: post.id, params: { status: newStatus } as any });
    } catch { /* toast */ }
  }

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      content: post.content || '',
      excerpt: post.excerpt || '',
      imageUrl: post.imageUrl || '',
      tags: post.tags.join(', '),
      authorName: post.authorName,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (editingId) {
        await vm.updatePost.mutateAsync({ id: editingId, params: payload as any });
      } else {
        await vm.createPost.mutateAsync(payload as any);
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
          <ShimmerTable rows={6} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Blog</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> Crear Articulo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar articulo..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Estado: Todos</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container)' }}>
              {['Titulo', 'Autor', 'Tags', 'Estado', 'Fecha Publicacion', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((post, idx) => {
              const sc = statusConfig[post.status] ?? statusConfig.draft;
              return (
                <tr
                  key={post.id}
                  className="border-t transition-colors hover:brightness-110"
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{post.title}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{post.authorName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: 'var(--accent-container)', color: 'var(--accent)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatDate(post.publishedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(post)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)' }}
                      >
                        <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Editar</span>
                      </button>
                      {post.status !== 'published' && (
                        <button
                          onClick={() => handleStatusChange(post, 'published')}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'var(--success-container)', color: 'var(--success)' }}
                        >
                          <span className="flex items-center gap-1"><Send className="h-3 w-3" /> Publicar</span>
                        </button>
                      )}
                      {post.status !== 'archived' && (
                        <button
                          onClick={() => handleStatusChange(post, 'archived')}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'var(--surface-variant)', color: 'var(--text-muted)' }}
                        >
                          <span className="flex items-center gap-1"><Archive className="h-3 w-3" /> Archivar</span>
                        </button>
                      )}
                      {post.status !== 'draft' && (
                        <button
                          onClick={() => handleStatusChange(post, 'draft')}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'var(--warning-container)', color: 'var(--warning)' }}
                        >
                          <span className="flex items-center gap-1"><FileEdit className="h-3 w-3" /> Borrador</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron articulos
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
                {editingId ? 'Editar Articulo' : 'Crear Articulo'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Titulo</label>
                <input
                  type="text"
                  placeholder="ej. Los 10 mejores restaurantes de La Laguna"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre del Autor</label>
                <input
                  type="text"
                  placeholder="ej. Ana Lucia Reyes"
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Contenido</label>
                <textarea
                  placeholder="Escribe el contenido del articulo..."
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={6}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Extracto</label>
                <textarea
                  placeholder="Resumen corto que aparece en la lista de articulos..."
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                folder="blog"
                label="Imagen"
              />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tags (separados por coma)</label>
                <input
                  type="text"
                  placeholder="gastronomia, cultura, turismo"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
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
                disabled={saving || !form.title}
                className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear'}
              </button>
            </div>
          </div>
      )}
    </div>
  );
}
