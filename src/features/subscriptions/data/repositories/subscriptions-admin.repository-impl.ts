import type { SubscriptionsAdminRepository } from '../../domain/repositories/subscriptions-admin.repository';
import type { SubscriptionsAdminDatasource } from '../datasources/subscriptions-admin.datasource';
import type { SubscriptionEntity, SubscriptionFilters } from '../../domain/entities/subscription.entity';
import { mapSubscriptionFromJson } from '../models/subscription.model';

export class SubscriptionsAdminRepositoryImpl {
  private datasource: SubscriptionsAdminDatasource;
  constructor(datasource: SubscriptionsAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: SubscriptionFilters): Promise<SubscriptionEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapSubscriptionFromJson) : [];
  }

  async getById(id: string): Promise<SubscriptionEntity> {
    const model = await this.datasource.getById(id);
    return mapSubscriptionFromJson(model);
  }

  async cancel(id: string): Promise<void> {
    await this.datasource.cancel(id);
  }
}
