import { useState, useMemo } from 'react';
import {
  useWallets,
  useTransactions,
  useAdjustBalance,
} from '../api/wallet-api';
import type {
  Wallet,
  WalletFilters,
  Transaction,
  TransactionFilters,
} from '../types/wallet';

export function useWalletAdmin() {
  const [walletFilters, setWalletFilters] = useState<WalletFilters>({});
  const [transactionFilters, setTransactionFilters] =
    useState<TransactionFilters>({});

  const walletsQuery = useWallets(walletFilters);
  const transactionsQuery = useTransactions(transactionFilters);
  const adjustBalance = useAdjustBalance();

  const wallets = (walletsQuery.data ?? []) as Wallet[];
  const transactions = (transactionsQuery.data ?? []) as Transaction[];

  const totalBalance = useMemo(
    () => wallets.reduce((sum, w) => sum + w.balance, 0),
    [wallets],
  );

  const totalTransactionVolume = useMemo(
    () => transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions],
  );

  const setWalletSearch = (search?: string) =>
    setWalletFilters((prev) => ({ ...prev, search, page: 1 }));

  const setWalletPage = (page: number) =>
    setWalletFilters((prev) => ({ ...prev, page }));

  const setTransactionPage = (page: number) =>
    setTransactionFilters((prev) => ({ ...prev, page }));

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
