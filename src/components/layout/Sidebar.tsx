import { NavLink } from 'react-router-dom';
import { tr } from '@/core/i18n/translations';
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  UtensilsCrossed,
  Map,
  Armchair,
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
  roles?: string[]; // if set, only these roles see this item
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: string[]; // if set, only these roles see this section
}

function getUserRole(): string {
  try {
    const user = JSON.parse(localStorage.getItem('lagunapp-admin-user') || '{}');
    return user?.role || 'admin';
  } catch { return 'admin'; }
}

function buildSections(): NavSection[] {
  return [
    {
      title: tr.mainSection,
      roles: ['admin'],
      items: [
        { label: tr.dashboard, to: '/', icon: LayoutDashboard },
        { label: tr.users, to: '/usuarios', icon: Users },
        { label: tr.moderation, to: '/moderacion', icon: Shield },
      ],
    },
    {
      title: tr.contentSection,
      items: [
        { label: tr.events, to: '/eventos', icon: CalendarDays },
        { label: tr.restaurants, to: '/restaurantes', icon: UtensilsCrossed },
        { label: tr.tours, to: '/tours', icon: Map },
        { label: tr.theaters, to: '/teatros', icon: Armchair, roles: ['admin', 'theater_manager', 'theater_submanager'] },
        { label: tr.blog, to: '/blog', icon: FileText },
        { label: tr.coupons, to: '/cupones', icon: Tag },
      ],
    },
    {
      title: tr.businessSection,
      roles: ['admin'],
      items: [
        { label: tr.tickets, to: '/tickets', icon: Ticket },
        { label: tr.subscriptions, to: '/suscripciones', icon: CreditCard },
        { label: tr.advertising, to: '/publicidad', icon: Megaphone },
        { label: tr.wallet, to: '/wallet', icon: Wallet },
        { label: tr.verifications, to: '/verificaciones', icon: ShieldCheck },
      ],
    },
    {
      title: tr.systemSection,
      roles: ['admin'],
      items: [
        { label: tr.notifications, to: '/notificaciones', icon: Bell },
        { label: tr.analytics, to: '/analiticas', icon: BarChart3 },
        { label: tr.settings, to: '/configuracion', icon: Settings },
      ],
    },
  ];
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { isDark, toggle } = useTheme();
  const role = getUserRole();

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
            {tr.appName}
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
          {buildSections()
            .filter((section) => !section.roles || section.roles.includes(role))
            .map((section) => {
              const visibleItems = section.items.filter(
                (item) => !item.roles || item.roles.includes(role),
              );
              if (visibleItems.length === 0) return null;
              return (
            <div key={section.title} className="mb-4">
              <p
                className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
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
              );
          })}
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
            {isDark ? tr.lightMode : tr.darkMode}
          </button>
        </div>
      </aside>
    </>
  );
}
