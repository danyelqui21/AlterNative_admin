import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  WalletEntity,
  WalletFilters,
  TransactionEntity,
  TransactionFilters,
  AdjustBalanceParams,
} from '../../domain/entities/wallet.entity';
import { WalletAdminRepositoryImpl } from '../../data/repositories/wallet-admin.repository-impl';
import { WalletAdminRemoteDatasource } from '../../data/datasources/wallet-admin.remote-datasource';

const datasource = new WalletAdminRemoteDatasource();
const repository = new WalletAdminRepositoryImpl(datasource);

export function useWalletAdminViewModel() {
  const qc = useQueryClient();
  const [walletFilters, setWalletFilters] = useState<WalletFilters>({});
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({});

  const walletsQuery = useQuery<WalletEntity[]>({
    queryKey: ['admin-wallets', walletFilters],
    queryFn: () => repository.getWallets(walletFilters),
  });

  const transactionsQuery = useQuery<TransactionEntity[]>({
    queryKey: ['admin-transactions', transactionFilters],
    queryFn: () => repository.getTransactions(transactionFilters),
  });

  const adjustBalance = useMutation<WalletEntity, Error, AdjustBalanceParams>({
    mutationFn: (params) => repository.adjustBalance(params),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['admin-wallets'] });
      qc.invalidateQueries({ queryKey: ['admin-wallet', userId] });
      qc.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });

  const wallets = (walletsQuery.data ?? []) as WalletEntity[];
  const transactions = (transactionsQuery.data ?? []) as TransactionEntity[];

  const totalBalance = useMemo(
    () => wallets.reduce((sum, w) => sum + w.balance, 0),
    [wallets],
  );

  const totalTransactionVolume = useMemo(
    () => transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions],
  );

  const setWalletSearch = useCallback((search?: string) =>
    setWalletFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setWalletPage = useCallback((page: number) =>
    setWalletFilters((prev) => ({ ...prev, page })), []);

  const setTransactionPage = useCallback((page: number) =>
    setTransactionFilters((prev) => ({ ...prev, page })), []);

  return {
    wallets,
    transactions,
    totalBalance,
    totalTransactionVolume,
    isLoadingWallets: walletsQuery.isLoading,
    isLoadingTransactions: transactionsQuery.isLoading,
    isError: walletsQuery.isError || transactionsQuery.isError,
    walletFilters,
    setWalletFilters,
    setWalletSearch,
    setWalletPage,
    transactionFilters,
    setTransactionFilters,
    setTransactionPage,
    adjustBalance,
  };
}
