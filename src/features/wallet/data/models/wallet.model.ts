import type { WalletEntity, TransactionEntity } from '../../domain/entities/wallet.entity';

export interface WalletModel {
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

export interface TransactionModel {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export function mapWalletFromJson(json: any): WalletEntity {
  return {
    id: json?.id ?? '',
    userId: json?.userId ?? '',
    userName: json?.userName ?? '',
    userEmail: json?.userEmail ?? '',
    balance: Number(json?.balance) || 0,
    currency: json?.currency ?? 'MXN',
    totalCredits: Number(json?.totalCredits) || 0,
    totalDebits: Number(json?.totalDebits) || 0,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}

export function mapTransactionFromJson(json: any): TransactionEntity {
  return {
    id: json?.id ?? '',
    userId: json?.userId ?? '',
    userName: json?.userName ?? '',
    userEmail: json?.userEmail ?? '',
    amount: Number(json?.amount) || 0,
    type: json?.type ?? 'credit',
    status: json?.status ?? 'pending',
    description: json?.description ?? '',
    referenceId: json?.referenceId ?? undefined,
    referenceType: json?.referenceType ?? undefined,
    createdAt: json?.createdAt ?? '',
  };
}
