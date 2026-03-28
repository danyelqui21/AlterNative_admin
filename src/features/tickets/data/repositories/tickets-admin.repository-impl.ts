import type { TicketsAdminRepository } from '../../domain/repositories/tickets-admin.repository';
import type { TicketsAdminDatasource } from '../datasources/tickets-admin.datasource';
import type { TicketEntity, TicketFilters, UpdateTicketParams } from '../../domain/entities/ticket.entity';
import { mapTicketFromJson } from '../models/ticket.model';

export class TicketsAdminRepositoryImpl {
  private datasource: TicketsAdminDatasource;
  constructor(datasource: TicketsAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: TicketFilters): Promise<TicketEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapTicketFromJson) : [];
  }

  async getById(id: string): Promise<TicketEntity> {
    const model = await this.datasource.getById(id);
    return mapTicketFromJson(model);
  }

  async update(id: string, params: UpdateTicketParams): Promise<TicketEntity> {
    const model = await this.datasource.update(id, params);
    return mapTicketFromJson(model);
  }

  async cancel(id: string): Promise<void> {
    await this.datasource.cancel(id);
  }

  async refund(id: string): Promise<void> {
    await this.datasource.refund(id);
  }
}
