import { apiClient } from '@/core/api/api-client';
import type { TheatersAdminDatasource } from './theaters-admin.datasource';
import type { TheaterModel } from '../models/theater.model';
import type { TheaterFilters, CreateTheaterParams, UpdateTheaterParams, CreateLayoutParams, SeatEntity } from '../../domain/entities/theater.entity';

export class TheatersAdminRemoteDatasource implements TheatersAdminDatasource {
  async getAll(filters?: TheaterFilters): Promise<TheaterModel[]> {
    const { data } = await apiClient.get('/admin/theaters', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<TheaterModel> {
    const { data } = await apiClient.get(`/admin/theaters/${id}`);
    return data?.data ?? data;
  }

  async create(params: CreateTheaterParams): Promise<TheaterModel> {
    const { data } = await apiClient.post('/admin/theaters', params);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateTheaterParams): Promise<TheaterModel> {
    const { data } = await apiClient.put(`/admin/theaters/${id}`, params);
    return data?.data ?? data;
  }

  async enable(id: string): Promise<TheaterModel> {
    const { data } = await apiClient.put(`/admin/theaters/${id}/enable`);
    return data?.data ?? data;
  }

  async disable(id: string): Promise<TheaterModel> {
    const { data } = await apiClient.put(`/admin/theaters/${id}/disable`);
    return data?.data ?? data;
  }

  async getLayout(theaterId: string, layoutId: string): Promise<any> {
    const { data } = await apiClient.get(`/admin/theaters/${theaterId}/layouts/${layoutId}`);
    return data?.data ?? data;
  }

  async createLayout(theaterId: string, params: CreateLayoutParams): Promise<any> {
    const { data } = await apiClient.post(`/admin/theaters/${theaterId}/layouts`, params);
    return data?.data ?? data;
  }

  async updateLayout(theaterId: string, layoutId: string, params: Partial<CreateLayoutParams>): Promise<any> {
    const { data } = await apiClient.put(`/admin/theaters/${theaterId}/layouts/${layoutId}`, params);
    return data?.data ?? data;
  }

  async bulkUpsertSeats(theaterId: string, layoutId: string, seats: SeatEntity[]): Promise<any[]> {
    const { data } = await apiClient.put(`/admin/theaters/${theaterId}/layouts/${layoutId}/seats`, { seats });
    return data?.data ?? data;
  }
}
