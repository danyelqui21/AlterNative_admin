import { apiClient } from '@/core/api/api-client';
import type { TicketsAdminDatasource } from './tickets-admin.datasource';
import type { TicketModel } from '../models/ticket.model';
import type { TicketFilters, UpdateTicketParams } from '../../domain/entities/ticket.entity';

export class TicketsAdminRemoteDatasource {
  async getAll(filters?: TicketFilters): Promise<TicketModel[]> {
    const { data } = await apiClient.get('/admin/tickets', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<TicketModel> {
    const { data } = await apiClient.get(`/admin/tickets/${id}`);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateTicketParams): Promise<TicketModel> {
    const { data } = await apiClient.patch(`/admin/tickets/${id}`, params);
    return data?.data ?? data;
  }

  async cancel(id: string): Promise<void> {
    await apiClient.post(`/admin/tickets/${id}/cancel`);
  }

  async refund(id: string): Promise<void> {
    await apiClient.post(`/admin/tickets/${id}/refund`);
  }
}
