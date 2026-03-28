import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  UtensilsCrossed,
  Map,
  FileText,
  Tag,
  Ticket,
  CreditCard,
  Megaphone,
  Wallet,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { useTheme } from '@/core/hooks/useTheme';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: 'PRINCIPAL',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboard },
      { label: 'Usuarios', to: '/usuarios', icon: Users },
      { label: 'Moderación', to: '/moderacion', icon: Shield },
    ],
  },
  {
    title: 'CONTENIDO',
    items: [
      { label: 'Eventos', to: '/eventos', icon: CalendarDays },
      { label: 'Restaurantes', to: '/restaurantes', icon: UtensilsCrossed },
      { label: 'Tours', to: '/tours', icon: Map },
      { label: 'Blog', to: '/blog', icon: FileText },
      { label: 'Cupones', to: '/cupones', icon: Tag },
    ],
  },
  {
    title: 'NEGOCIO',
    items: [
      { label: 'Tickets', to: '/tickets', icon: Ticket },
      { label: 'Suscripciones', to: '/suscripciones', icon: CreditCard },
      { label: 'Publicidad', to: '/publicidad', icon: Megaphone },
      { label: 'Wallet', to: '/wallet', icon: Wallet },
      { label: 'Verificaciones', to: '/verificaciones', icon: ShieldCheck },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { label: 'Notificaciones', to: '/notificaciones', icon: Bell },
      { label: 'Analíticas', to: '/analiticas', icon: BarChart3 },
      { label: 'Configuración', to: '/configuracion', icon: Settings },
    ],
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { isDark, toggle } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-full w-[260px] flex-col
          border-r transition-transform duration-300 lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5">
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--primary)' }}
          >
            LagunApp Admin
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 lg:hidden"
            style={{ color: 'var(--on-surface)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <p
                className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                      style={({ isActive }) =>
                        isActive
                          ? {
                              backgroundColor: 'var(--primary-container)',
                              color: 'var(--primary)',
                            }
                          : {
                              color: 'var(--on-surface)',
                            }
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Theme toggle */}
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--on-surface)' }}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </aside>
    </>
  );
}
