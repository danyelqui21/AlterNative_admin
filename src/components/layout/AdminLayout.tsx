import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/usuarios': 'Usuarios',
  '/moderacion': 'Moderación',
  '/eventos': 'Eventos',
  '/restaurantes': 'Restaurantes',
  '/tours': 'Tours',
  '/blog': 'Blog',
  '/cupones': 'Cupones',
  '/tickets': 'Tickets',
  '/suscripciones': 'Suscripciones',
  '/publicidad': 'Publicidad',
  '/wallet': 'Wallet',
  '/analiticas': 'Analíticas',
  '/configuracion': 'Configuración',
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] ?? 'Admin';

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:ml-[260px]">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 lg:px-6"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Left side: hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 lg:hidden"
              style={{ color: 'var(--on-surface)' }}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1
              className="text-lg font-semibold"
              style={{ color: 'var(--on-surface)' }}
            >
              {currentTitle}
            </h1>
          </div>

          {/* Right side: notifications + avatar */}
          <div className="flex items-center gap-3">
            <button
              className="relative rounded-lg p-2 transition-colors"
              style={{ color: 'var(--on-surface-variant)' }}
            >
              <Bell className="h-5 w-5" />
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--error)' }}
              />
            </button>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
