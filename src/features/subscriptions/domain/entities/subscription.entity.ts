export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface SubscriptionEntity {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  entityId: string;
  entityType: 'restaurant' | 'organizer';
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFilters {
  tier?: SubscriptionTier;
  status?: SubscriptionStatus;
  entityType?: 'restaurant' | 'organizer';
  search?: string;
  page?: number;
  limit?: number;
}
