import { useState, useEffect } from 'react';
import { useWalletAdminViewModel } from '@/features/wallet/presentation/viewmodels/wallet-admin.viewmodel';
import { Shimmer } from '@/components/ui/Shimmer';
import {
  Wallet,
  DollarSign,
  Snowflake,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  Lock,
  Unlock,
} from 'lucide-react';

interface WalletStats {
  totalWallets: number;
  totalBalance: number;
  frozen: number;
  active: number;
}

interface WalletItem {
  id: string;
  userId: string;
  balance: number;
  status: 'active' | 'frozen' | 'suspended';
  createdAt: string;
}

interface WalletsResponse {
  data: WalletItem[];
  total: number;
  page: number;
  limit: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Activa', value: 'active' },
  { label: 'Congelada', value: 'frozen' },
  { label: 'Suspendida', value: 'suspended' },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: 'var(--success-container)', text: 'var(--success)' },
  frozen: { bg: 'var(--accent-container)', text: 'var(--accent)' },
  suspended: { bg: 'var(--error-container)', text: 'var(--error)' },
};

const statusLabels: Record<string, string> = {
  active: 'Activa',
  frozen: 'Congelada',
  suspended: 'Suspendida',
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

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

export default function WalletAdminPage() {
  const vm = useWalletAdminViewModel();
  const wallets = vm.wallets as unknown as WalletItem[];
  const loading = vm.isLoadingWallets;
  const total = wallets.length;

  const stats: WalletStats | null = {
    totalWallets: wallets.length,
    totalBalance: vm.totalBalance,
    frozen: 0,
    active: wallets.length,
  };

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Adjust balance modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustWallet, setAdjustWallet] = useState<WalletItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Transaction history
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(vm.transactions as unknown as Transaction[]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Sync filters to viewmodel
  useEffect(() => { vm.setWalletSearch(search || undefined); }, [search]);
  useEffect(() => { vm.setWalletPage(page); }, [page]);

  const handleFreezeToggle = async (wallet: WalletItem) => {
    try {
      // Freeze/unfreeze via viewmodel adjust
      await vm.adjustBalance.mutateAsync({ userId: wallet.userId, amount: 0, reason: wallet.status === 'frozen' ? 'unfreeze' : 'freeze' } as any);
    } catch {
      /* ignore */
    }
  };

  const openAdjustModal = (wallet: WalletItem) => {
    setAdjustWallet(wallet);
    setAdjustAmount('');
    setAdjustType('credit');
    setAdjustDescription('');
    setShowAdjustModal(true);
  };

  const handleAdjust = async () => {
    if (!adjustWallet) return;
    setSubmitting(true);
    try {
      const amount = parseFloat(adjustAmount) || 0;
      await vm.adjustBalance.mutateAsync({
        userId: adjustWallet.userId,
        amount: adjustType === 'debit' ? -amount : amount,
        reason: adjustDescription,
      } as any);
      setShowAdjustModal(false);
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const openTransactions = async (wallet: WalletItem) => {
    setSelectedWallet(wallet);
    setShowTransactions(true);
    setLoadingTx(true);
    try {
      // Transactions come from the viewmodel
      setTransactions(vm.transactions as unknown as Transaction[]);
    } catch {
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statsCards = stats
    ? [
        { label: 'Total wallets', value: stats.totalWallets.toLocaleString('es-MX'), icon: Wallet, color: 'var(--primary)' },
        { label: 'Balance total', value: formatCurrency(stats.totalBalance), icon: DollarSign, color: 'var(--secondary)' },
        { label: 'Congeladas', value: stats.frozen.toLocaleString('es-MX'), icon: Snowflake, color: 'var(--accent)' },
        { label: 'Activas', value: stats.active.toLocaleString('es-MX'), icon: CheckCircle, color: 'var(--success)' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Wallet className="h-8 w-8" style={{ color: 'var(--primary)' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Administracion de Wallets
        </h1>
      </div>

      {/* Stats */}
      {stats && (
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
      )}

      {/* Filters */}
      <div
        className="flex flex-wrap items-end gap-3 rounded-2xl border p-4"
        style={{ backgroundColor: 'var(--surface)' }}
      >
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
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Buscar usuario</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ID de usuario..."
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
                {['ID Usuario', 'Balance', 'Estado', 'Creado', 'Acciones'].map(
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
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Shimmer className="h-5 rounded" style={{ width: `${50 + (j * 13) % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No se encontraron wallets</p>
                  </td>
                </tr>
              ) : (
                wallets.map((w) => {
                  const st = statusStyles[w.status] ?? { bg: 'var(--surface-variant)', text: 'var(--text-muted)' };
                  return (
                    <tr
                      key={w.id}
                      className="cursor-pointer border-t transition-colors hover:brightness-110"
                      style={{ borderColor: 'var(--border)' }}
                      onClick={() => openTransactions(w)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                        {truncate(w.userId, 16)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(w.balance)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.text }}
                        >
                          {statusLabels[w.status] ?? w.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(w.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openAdjustModal(w)}
                            className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                            style={{ color: 'var(--secondary)' }}
                            title="Ajustar balance"
                          >
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleFreezeToggle(w)}
                            className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                            style={{ color: w.status === 'frozen' ? 'var(--success)' : 'var(--accent)' }}
                            title={w.status === 'frozen' ? 'Descongelar' : 'Congelar'}
                          >
                            {w.status === 'frozen' ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </button>
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

      {/* Adjust Balance Modal */}
      {showAdjustModal && adjustWallet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Ajustar Balance
              </h2>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="rounded-lg p-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Wallet de usuario: <span className="font-mono">{truncate(adjustWallet.userId, 20)}</span>
            </p>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Balance actual: <span className="font-bold">{formatCurrency(adjustWallet.balance)}</span>
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as 'credit' | 'debit')}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    backgroundColor: 'var(--surface-container)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="credit">Credito (agregar)</option>
                  <option value="debit">Debito (restar)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Monto (MXN)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="0.00"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    backgroundColor: 'var(--surface-container)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Descripcion</label>
                <textarea
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  placeholder="Razon del ajuste..."
                  rows={3}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    backgroundColor: 'var(--surface-container)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAdjust}
                disabled={submitting || !adjustAmount || !adjustDescription}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {submitting ? 'Aplicando...' : 'Aplicar ajuste'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactions && selectedWallet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-2xl rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Historial de transacciones
              </h2>
              <button
                onClick={() => setShowTransactions(false)}
                className="rounded-lg p-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Usuario: <span className="font-mono">{truncate(selectedWallet.userId, 20)}</span>
              {' | '}
              Balance: <span className="font-bold">{formatCurrency(selectedWallet.balance)}</span>
            </p>

            <div className="max-h-96 overflow-y-auto">
              {loadingTx ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Shimmer key={j} className="h-5 flex-1 rounded" />
                      ))}
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No hay transacciones
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-container)' }}>
                      {['Tipo', 'Monto', 'Descripcion', 'Fecha'].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-t"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <td className="whitespace-nowrap px-4 py-2 text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                          {tx.type}
                        </td>
                        <td
                          className="whitespace-nowrap px-4 py-2 font-medium"
                          style={{ color: tx.amount >= 0 ? 'var(--success)' : 'var(--error)' }}
                        >
                          {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {tx.description}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTransactions(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
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
