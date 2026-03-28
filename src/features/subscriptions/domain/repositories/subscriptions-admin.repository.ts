import type { SubscriptionEntity, SubscriptionFilters } from '../entities/subscription.entity';

export interface SubscriptionsAdminRepository {
  getAll(filters?: SubscriptionFilters): Promise<SubscriptionEntity[]>;
  getById(id: string): Promise<SubscriptionEntity>;
  cancel(id: string): Promise<void>;
}
