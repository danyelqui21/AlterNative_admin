import type { WalletAdminRepository } from '../../domain/repositories/wallet-admin.repository';
import type { WalletAdminDatasource } from '../datasources/wallet-admin.datasource';
import type {
  WalletEntity,
  WalletFilters,
  TransactionEntity,
  TransactionFilters,
  AdjustBalanceParams,
} from '../../domain/entities/wallet.entity';
import { mapWalletFromJson, mapTransactionFromJson } from '../models/wallet.model';

export class WalletAdminRepositoryImpl {
  private datasource: WalletAdminDatasource;
  constructor(datasource: WalletAdminDatasource) { this.datasource = datasource; }

  async getWallets(filters?: WalletFilters): Promise<WalletEntity[]> {
    const models = await this.datasource.getWallets(filters);
    return Array.isArray(models) ? models.map(mapWalletFromJson) : [];
  }

  async getWallet(userId: string): Promise<WalletEntity> {
    const model = await this.datasource.getWallet(userId);
    return mapWalletFromJson(model);
  }

  async getTransactions(filters?: TransactionFilters): Promise<TransactionEntity[]> {
    const models = await this.datasource.getTransactions(filters);
    return Array.isArray(models) ? models.map(mapTransactionFromJson) : [];
  }

  async adjustBalance(params: AdjustBalanceParams): Promise<WalletEntity> {
    const model = await this.datasource.adjustBalance(params);
    return mapWalletFromJson(model);
  }
}
