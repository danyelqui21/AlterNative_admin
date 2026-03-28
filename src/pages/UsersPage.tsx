import { useState, useEffect } from 'react';
import { useUsersAdminViewModel } from '@/features/users/presentation/viewmodels/users-admin.viewmodel';
import { ShimmerTable } from '@/components/ui/Shimmer';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  verified: boolean;
  active: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

const roles = [
  { value: '', label: 'Todos' },
  { value: 'user', label: 'Usuario' },
  { value: 'organizer', label: 'Organizador' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'scanner_staff', label: 'Staff Scanner' },
  { value: 'admin', label: 'Admin' },
];

const roleLabelMap: Record<string, string> = {
  user: 'Usuario',
  organizer: 'Organizador',
  restaurant: 'Restaurante',
  scanner_staff: 'Staff Scanner',
  admin: 'Admin',
};

const roleColorMap: Record<string, string> = {
  user: 'var(--accent)',
  organizer: 'var(--primary)',
  restaurant: 'var(--secondary)',
  scanner_staff: 'var(--warning)',
  admin: 'var(--error)',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function UsersPage() {
  const vm = useUsersAdminViewModel();
  const users = vm.users as unknown as UserItem[];
  const loading = vm.isLoading;
  const total = vm.totalCount;
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'disabled'>('');
  const [verifiedFilter, setVerifiedFilter] = useState<'' | 'true' | 'false'>('');
  const [cityFilter, setCityFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState('');

  // Create user form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', city: '' });
  const [creating, setCreating] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sync filters to viewmodel
  useEffect(() => { vm.setSearchFilter(search || undefined); }, [search]);
  useEffect(() => { vm.setRoleFilter(roleFilter ? roleFilter as any : undefined); }, [roleFilter]);
  useEffect(() => {
    if (statusFilter === 'active') vm.setActiveFilter(true);
    else if (statusFilter === 'disabled') vm.setActiveFilter(false);
    else vm.setActiveFilter(undefined);
  }, [statusFilter]);
  useEffect(() => { vm.setPage(page); }, [page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, verifiedFilter, cityFilter]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function toggleActive(user: UserItem) {
    setActionLoading(user.id);
    try {
      await vm.updateUser.mutateAsync({ id: user.id, params: { isActive: !user.active } as any });
    } finally {
      setActionLoading(null);
    }
  }

  async function verifyUser(user: UserItem) {
    setActionLoading(user.id);
    try {
      await vm.updateUser.mutateAsync({ id: user.id, params: { isVerified: true } as any });
    } finally {
      setActionLoading(null);
    }
  }

  async function changeRole() {
    if (!roleChangeUser || !newRole) return;
    setActionLoading(roleChangeUser.id);
    try {
      await vm.updateUser.mutateAsync({ id: roleChangeUser.id, params: { role: newRole } as any });
      setRoleChangeUser(null);
      setNewRole('');
    } finally {
      setActionLoading(null);
    }
  }

  async function createUser() {
    setCreating(true);
    try {
      await vm.updateUser.mutateAsync({ id: 'new', params: newUser as any });
      setCreateModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', city: '' });
    } finally {
      setCreating(false);
    }
  }

  const stats = [
    { label: 'Total', value: total.toLocaleString('es-MX'), color: 'var(--primary)' },
    { label: 'Activos', value: String(users.filter((u) => u.active).length), color: 'var(--success)' },
    { label: 'Deshabilitados', value: String(users.filter((u) => !u.active).length), color: 'var(--error)' },
    { label: 'Verificados', value: String(users.filter((u) => u.verified).length), color: 'var(--accent)' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Gestion de Usuarios
        </h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          + Crear Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
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
      <div className="flex flex-col lg:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | 'active' | 'disabled')}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="disabled">Deshabilitados</option>
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value as '' | 'true' | 'false')}
          className="px-4 py-2 rounded-xl border text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">Verificacion: Todos</option>
          <option value="true">Verificados</option>
          <option value="false">No verificados</option>
        </select>
        <input
          type="text"
          placeholder="Ciudad..."
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm outline-none w-40"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <ShimmerTable rows={8} cols={7} />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No se encontraron usuarios</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Intenta cambiar los filtros de busqueda</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div
            className="rounded-2xl border overflow-x-auto"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-container)' }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Rol</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Ciudad</th>
                  <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Verificado</th>
                  <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Activo</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Registro</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="border-t transition-colors hover:brightness-110"
                    style={{
                      backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--surface-variant) 50%, transparent)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: roleColorMap[user.role] ?? 'var(--text-muted)', color: '#fff' }}
                      >
                        {roleLabelMap[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {user.city || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.verified ? (
                        <span style={{ color: 'var(--success)' }} title="Verificado">&#10003;</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }} title="No verificado">&#10005;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: user.active ? 'var(--success)' : 'var(--error)' }}
                        title={user.active ? 'Activo' : 'Deshabilitado'}
                      />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => toggleActive(user)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                          style={{
                            backgroundColor: user.active ? 'var(--error)' : 'var(--success)',
                            color: '#fff',
                            borderColor: user.active ? 'var(--error)' : 'var(--success)',
                          }}
                        >
                          {user.active ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                        {!user.verified && (
                          <button
                            onClick={() => verifyUser(user)}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: '#fff',
                              borderColor: 'var(--accent)',
                            }}
                          >
                            Verificar
                          </button>
                        )}
                        <button
                          onClick={() => { setRoleChangeUser(user); setNewRole(user.role); }}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          Cambiar Rol
                        </button>
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
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
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
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="rounded-2xl p-6 w-full max-w-lg space-y-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Crear Usuario</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <input
                type="password"
                placeholder="Contrasena"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                {roles.filter((r) => r.value).map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Ciudad"
                value={newUser.city}
                onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={createUser}
                disabled={creating || !newUser.name || !newUser.email || !newUser.password}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="rounded-2xl p-6 w-full max-w-sm space-y-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Cambiar Rol de {roleChangeUser.name}
            </h2>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
              style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {roles.filter((r) => r.value).map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRoleChangeUser(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={changeRole}
                disabled={actionLoading === roleChangeUser.id}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
