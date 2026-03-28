import type {
  EventEntity,
  EventFilters,
  CreateEventParams,
  UpdateEventParams,
  EventStats,
} from '../entities/event.entity';

export interface EventsAdminRepository {
  getAll(filters?: EventFilters): Promise<EventEntity[]>;
  getById(id: string): Promise<EventEntity>;
  create(params: CreateEventParams): Promise<EventEntity>;
  update(id: string, params: UpdateEventParams): Promise<EventEntity>;
  cancel(id: string): Promise<EventEntity>;
  activate(id: string): Promise<EventEntity>;
  feature(id: string, featured: boolean): Promise<EventEntity>;
  delete(id: string): Promise<void>;
  getStats(): Promise<EventStats>;
}
