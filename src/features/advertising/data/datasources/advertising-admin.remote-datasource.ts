import { apiClient } from '@/core/api/api-client';
import type { AdvertisingAdminDatasource } from './advertising-admin.datasource';
import type { AdModel } from '../models/ad.model';
import type { AdFilters, CreateAdParams, UpdateAdParams } from '../../domain/entities/ad.entity';

export class AdvertisingAdminRemoteDatasource {
  async getAll(filters?: AdFilters): Promise<AdModel[]> {
    const { data } = await apiClient.get('/admin/advertising', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<AdModel> {
    const { data } = await apiClient.get(`/admin/advertising/${id}`);
    return data?.data ?? data;
  }

  async create(params: CreateAdParams): Promise<AdModel> {
    const { data } = await apiClient.post('/admin/advertising', params);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateAdParams): Promise<AdModel> {
    const { data } = await apiClient.put(`/admin/advertising/${id}`, params);
    return data?.data ?? data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/advertising/${id}`);
  }
}
