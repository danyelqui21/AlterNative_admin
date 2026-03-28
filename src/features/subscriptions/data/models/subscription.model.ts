import type { SubscriptionEntity } from '../../domain/entities/subscription.entity';

export interface SubscriptionModel {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  entityId: string;
  entityType: string;
  tier: string;
  status: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapSubscriptionFromJson(json: any): SubscriptionEntity {
  return {
    id: json?.id ?? '',
    userId: json?.userId ?? '',
    userName: json?.userName ?? undefined,
    userEmail: json?.userEmail ?? undefined,
    entityId: json?.entityId ?? '',
    entityType: json?.entityType ?? 'restaurant',
    tier: json?.tier ?? 'free',
    status: json?.status ?? 'active',
    amount: Number(json?.amount) || 0,
    currency: json?.currency ?? 'MXN',
    startDate: json?.startDate ?? '',
    endDate: json?.endDate ?? '',
    autoRenew: json?.autoRenew ?? false,
    stripeSubscriptionId: json?.stripeSubscriptionId ?? undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
