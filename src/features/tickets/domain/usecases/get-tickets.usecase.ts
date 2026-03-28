import type { TicketEntity, TicketFilters } from '../entities/ticket.entity';

export class GetTicketsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: TicketFilters): Promise<TicketEntity[]> {
    return this.repository.getAll(filters);
  }
}
