import { apiClient } from '@/core/api/api-client';
import type { WalletAdminDatasource } from './wallet-admin.datasource';
import type { WalletModel, TransactionModel } from '../models/wallet.model';
import type { WalletFilters, TransactionFilters, AdjustBalanceParams } from '../../domain/entities/wallet.entity';

export class WalletAdminRemoteDatasource {
  async getWallets(filters?: WalletFilters): Promise<WalletModel[]> {
    const { data } = await apiClient.get('/admin/wallets', { params: filters });
    return data?.data ?? data;
  }

  async getWallet(userId: string): Promise<WalletModel> {
    const { data } = await apiClient.get(`/admin/wallets/${userId}`);
    return data?.data ?? data;
  }

  async getTransactions(filters?: TransactionFilters): Promise<TransactionModel[]> {
    const { data } = await apiClient.get('/admin/wallets/transactions', { params: filters });
    return data?.data ?? data;
  }

  async adjustBalance(params: AdjustBalanceParams): Promise<WalletModel> {
    const { data } = await apiClient.post('/admin/wallets/adjust', params);
    return data?.data ?? data;
  }
}
