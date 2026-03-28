import type { WalletFilters, TransactionFilters, AdjustBalanceParams } from '../../domain/entities/wallet.entity';
import type { WalletModel, TransactionModel } from '../models/wallet.model';

export interface WalletAdminDatasource {
  getWallets(filters?: WalletFilters): Promise<WalletModel[]>;
  getWallet(userId: string): Promise<WalletModel>;
  getTransactions(filters?: TransactionFilters): Promise<TransactionModel[]>;
  adjustBalance(params: AdjustBalanceParams): Promise<WalletModel>;
}
