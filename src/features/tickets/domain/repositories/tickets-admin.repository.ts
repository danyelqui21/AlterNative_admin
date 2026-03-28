import type { TicketEntity, TicketFilters, UpdateTicketParams } from '../entities/ticket.entity';

export interface TicketsAdminRepository {
  getAll(filters?: TicketFilters): Promise<TicketEntity[]>;
  getById(id: string): Promise<TicketEntity>;
  update(id: string, params: UpdateTicketParams): Promise<TicketEntity>;
  cancel(id: string): Promise<void>;
  refund(id: string): Promise<void>;
}
