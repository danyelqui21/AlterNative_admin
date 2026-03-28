import type { TicketFilters, UpdateTicketParams } from '../../domain/entities/ticket.entity';
import type { TicketModel } from '../models/ticket.model';

export interface TicketsAdminDatasource {
  getAll(filters?: TicketFilters): Promise<TicketModel[]>;
  getById(id: string): Promise<TicketModel>;
  update(id: string, params: UpdateTicketParams): Promise<TicketModel>;
  cancel(id: string): Promise<void>;
  refund(id: string): Promise<void>;
}
