import type { SubscriptionFilters } from '../../domain/entities/subscription.entity';
import type { SubscriptionModel } from '../models/subscription.model';

export interface SubscriptionsAdminDatasource {
  getAll(filters?: SubscriptionFilters): Promise<SubscriptionModel[]>;
  getById(id: string): Promise<SubscriptionModel>;
  cancel(id: string): Promise<void>;
}
