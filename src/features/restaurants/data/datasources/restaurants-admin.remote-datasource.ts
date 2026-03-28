import { apiClient } from '@/core/api/api-client';
import type { RestaurantsAdminDatasource } from './restaurants-admin.datasource';
import type { RestaurantModel } from '../models/restaurant.model';
import type { RestaurantFilters, CreateRestaurantParams, UpdateRestaurantParams } from '../../domain/entities/restaurant.entity';

export class RestaurantsAdminRemoteDatasource {
  async getAll(filters?: RestaurantFilters): Promise<RestaurantModel[]> {
    const { data } = await apiClient.get('/admin/restaurants', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<RestaurantModel> {
    const { data } = await apiClient.get(`/admin/restaurants/${id}`);
    return data?.data ?? data;
  }

  async create(params: CreateRestaurantParams): Promise<RestaurantModel> {
    const { data } = await apiClient.post('/admin/restaurants', params);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateRestaurantParams): Promise<RestaurantModel> {
    const { data } = await apiClient.put(`/admin/restaurants/${id}`, params);
    return data?.data ?? data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/restaurants/${id}`);
  }
}
