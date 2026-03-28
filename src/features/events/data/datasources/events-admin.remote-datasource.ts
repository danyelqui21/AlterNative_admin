import { apiClient } from '@/core/api/api-client';
import type { EventsAdminDatasource } from './events-admin.datasource';
import type { EventModel } from '../models/event.model';
import type { EventFilters, CreateEventParams, UpdateEventParams } from '../../domain/entities/event.entity';

export class EventsAdminRemoteDatasource {
  async getAll(filters?: EventFilters): Promise<EventModel[]> {
    const { data } = await apiClient.get('/admin/events', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<EventModel> {
    const { data } = await apiClient.get(`/admin/events/${id}`);
    return data?.data ?? data;
  }

  async create(params: CreateEventParams): Promise<EventModel> {
    const { data } = await apiClient.post('/admin/events', params);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateEventParams): Promise<EventModel> {
    const { data } = await apiClient.put(`/admin/events/${id}`, params);
    return data?.data ?? data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/events/${id}`);
  }

  async getStats(): Promise<{ totalEvents: number; activeEvents: number; totalTicketsSold: number; totalRevenue: number }> {
    const { data } = await apiClient.get('/admin/events/stats');
    return data?.data ?? data;
  }
}
