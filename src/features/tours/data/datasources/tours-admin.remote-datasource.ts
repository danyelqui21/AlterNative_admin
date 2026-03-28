import { apiClient } from '@/core/api/api-client';
import type { ToursAdminDatasource } from './tours-admin.datasource';
import type { TourModel } from '../models/tour.model';
import type { TourFilters, CreateTourParams, UpdateTourParams } from '../../domain/entities/tour.entity';

export class ToursAdminRemoteDatasource {
  async getAll(filters?: TourFilters): Promise<TourModel[]> {
    const { data } = await apiClient.get('/admin/tours', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<TourModel> {
    const { data } = await apiClient.get(`/admin/tours/${id}`);
    return data?.data ?? data;
  }

  async create(params: CreateTourParams): Promise<TourModel> {
    const { data } = await apiClient.post('/admin/tours', params);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateTourParams): Promise<TourModel> {
    const { data } = await apiClient.put(`/admin/tours/${id}`, params);
    return data?.data ?? data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/tours/${id}`);
  }
}
