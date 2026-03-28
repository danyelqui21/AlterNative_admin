import type { EventEntity, EventFilters } from '../entities/event.entity';

export class GetEventsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: EventFilters): Promise<EventEntity[]> {
    return this.repository.getAll(filters);
  }
}
