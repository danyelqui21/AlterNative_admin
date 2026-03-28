import type { EventEntity, UpdateEventParams } from '../entities/event.entity';

export class UpdateEventUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string, params: UpdateEventParams): Promise<EventEntity> {
    return this.repository.update(id, params);
  }
}
