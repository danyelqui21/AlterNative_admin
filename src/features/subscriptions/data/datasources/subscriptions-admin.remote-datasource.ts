import { apiClient } from '@/core/api/api-client';
import type { SubscriptionsAdminDatasource } from './subscriptions-admin.datasource';
import type { SubscriptionModel } from '../models/subscription.model';
import type { SubscriptionFilters } from '../../domain/entities/subscription.entity';

export class SubscriptionsAdminRemoteDatasource {
  async getAll(filters?: SubscriptionFilters): Promise<SubscriptionModel[]> {
    const { data } = await apiClient.get('/admin/subscriptions', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<SubscriptionModel> {
    const { data } = await apiClient.get(`/admin/subscriptions/${id}`);
    return data?.data ?? data;
  }

  async cancel(id: string): Promise<void> {
    await apiClient.post(`/admin/subscriptions/${id}/cancel`);
  }
}
