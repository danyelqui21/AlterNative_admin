import type {
  WalletEntity,
  WalletFilters,
  TransactionEntity,
  TransactionFilters,
  AdjustBalanceParams,
} from '../entities/wallet.entity';

export interface WalletAdminRepository {
  getWallets(filters?: WalletFilters): Promise<WalletEntity[]>;
  getWallet(userId: string): Promise<WalletEntity>;
  getTransactions(filters?: TransactionFilters): Promise<TransactionEntity[]>;
  adjustBalance(params: AdjustBalanceParams): Promise<WalletEntity>;
}
