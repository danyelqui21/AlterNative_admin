import { useState } from 'react';
import {
  Settings,
  Pencil,
  Bell,
  Shield,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

interface CommissionTier {
  range: string;
  rate: string;
}

const commissionTiers: CommissionTier[] = [
  { range: '0 - 100 tickets', rate: '15%' },
  { range: '100 - 500 tickets', rate: '12%' },
  { range: '500 - 1,000 tickets', rate: '10%' },
  { range: '1,000+ tickets', rate: '8%' },
];

export default function SettingsAdminPage() {
  const [platformName, setPlatformName] = useState('LagunApp');
  const [supportEmail, setSupportEmail] = useState('soporte@lagunapp.com');
  const [supportPhone, setSupportPhone] = useState('+52 871 123 4567');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);

  const [force2FA, setForce2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('1hr');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" style={{ color: 'var(--primary)' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Configuracion de la Plataforma
        </h1>
      </div>

      {/* Comisiones */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Comisiones
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-container)' }}>
                {['Rango', 'Comision', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissionTiers.map((tier) => (
                <tr
                  key={tier.range}
                  className="border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {tier.range}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--secondary)' }}>
                    <span className="font-semibold">{tier.rate}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* General */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          General
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Nombre de la plataforma
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full max-w-md rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email de soporte
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full max-w-md rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Telefono de soporte
            </label>
            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full max-w-md rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Notificaciones
          </h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Notificaciones por email"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <ToggleRow
            label="Notificaciones push"
            checked={pushNotifications}
            onChange={setPushNotifications}
          />
          <ToggleRow
            label="Notificaciones por WhatsApp"
            checked={whatsappNotifications}
            onChange={setWhatsappNotifications}
          />
        </div>
      </div>

      {/* Seguridad */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Seguridad
          </h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Forzar 2FA para todos los administradores"
            checked={force2FA}
            onChange={setForce2FA}
          />
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Tiempo de expiracion de sesion
            </label>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="30min">30 minutos</option>
              <option value="1hr">1 hora</option>
              <option value="4hr">4 horas</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Intentos maximos de inicio de sesion
            </label>
            <select
              value={maxLoginAttempts}
              onChange={(e) => setMaxLoginAttempts(e.target.value)}
              className="rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mantenimiento */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Wrench className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Mantenimiento
          </h2>
        </div>
        <ToggleRow
          label="Modo de mantenimiento"
          checked={maintenanceMode}
          onChange={setMaintenanceMode}
        />
        {maintenanceMode && (
          <div
            className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: 'var(--warning-container)',
              color: 'var(--warning)',
            }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              La plataforma esta en modo mantenimiento. Los usuarios no podran acceder a la aplicacion.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{
          backgroundColor: checked ? 'var(--primary)' : 'var(--surface-variant)',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}
