import type { EventEntity, CreateEventParams } from '../entities/event.entity';

export class CreateEventUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: CreateEventParams): Promise<EventEntity> {
    return this.repository.create(params);
  }
}
