export type TransactionType = 'credit' | 'debit' | 'refund' | 'withdrawal' | 'commission';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface TransactionEntity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface WalletEntity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  currency: string;
  totalCredits: number;
  totalDebits: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletFilters {
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionFilters {
  userId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdjustBalanceParams {
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
}
