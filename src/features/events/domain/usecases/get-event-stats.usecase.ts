import type { EventStats } from '../entities/event.entity';

export class GetEventStatsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(): Promise<EventStats> {
    return this.repository.getStats();
  }
}
