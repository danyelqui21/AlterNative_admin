import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  Wallet,
  WalletFilters,
  Transaction,
  TransactionFilters,
  AdjustBalanceRequest,
} from '../types/wallet';

export function useWallets(filters?: WalletFilters) {
  return useQuery<Wallet[]>({
    queryKey: ['admin-wallets', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/wallets', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useWallet(userId: string) {
  return useQuery<Wallet>({
    queryKey: ['admin-wallet', userId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/wallets/${userId}`);
      return data?.data ?? data;
    },
    enabled: !!userId,
  });
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery<Transaction[]>({
    queryKey: ['admin-transactions', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/wallets/transactions', {
        params: filters,
      });
      return data?.data ?? data;
    },
  });
}

export function useAdjustBalance() {
  const qc = useQueryClient();
  return useMutation<Wallet, Error, AdjustBalanceRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/wallets/adjust', payload);
      return data?.data ?? data;
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['admin-wallets'] });
      qc.invalidateQueries({ queryKey: ['admin-wallet', userId] });
      qc.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });
}
