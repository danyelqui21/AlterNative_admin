import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuthAdminViewModel } from '../features/auth/presentation/viewmodels/auth-admin.viewmodel';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, loginLoading: loading, loginError } = useAuthAdminViewModel();

  const displayError = error || (loginError?.message ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const result = await login({ email, password });
      const allowedRoles = ['admin', 'theater_manager', 'theater_submanager'];
      if (!allowedRoles.includes(result.user?.role)) {
        setError('Acceso restringido a administradores y gerentes de teatro');
        return;
      }
      localStorage.setItem('lagunapp-admin-user', JSON.stringify(result.user));
      const isTheaterRole = ['theater_manager', 'theater_submanager'].includes(result.user?.role);
      navigate(isTheaterRole ? '/teatros' : '/');
    } catch (err: any) {
      setError(err.message || 'Credenciales invalidas');
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--primary)' }}
          >
            LagunApp Admin
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Panel de Administracion
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <div
            className="mb-4 px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'rgba(230,57,70,0.1)', color: 'var(--error)' }}
          >
            {displayError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lagunapp.com"
              required
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Iniciar Sesion
          </button>
        </form>
      </div>
    </div>
  );
}
