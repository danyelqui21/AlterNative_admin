import type { EventEntity } from '../entities/event.entity';

export class CancelEventUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string): Promise<EventEntity> {
    return this.repository.cancel(id);
  }
}
