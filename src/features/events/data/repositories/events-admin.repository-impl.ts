import type { EventsAdminRepository } from '../../domain/repositories/events-admin.repository';
import type { EventsAdminDatasource } from '../datasources/events-admin.datasource';
import type {
  EventEntity,
  EventFilters,
  CreateEventParams,
  UpdateEventParams,
  EventStats,
} from '../../domain/entities/event.entity';
import { mapEventFromJson } from '../models/event.model';

export class EventsAdminRepositoryImpl {
  private datasource: EventsAdminDatasource;
  constructor(datasource: EventsAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: EventFilters): Promise<EventEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapEventFromJson) : [];
  }

  async getById(id: string): Promise<EventEntity> {
    const model = await this.datasource.getById(id);
    return mapEventFromJson(model);
  }

  async create(params: CreateEventParams): Promise<EventEntity> {
    const model = await this.datasource.create(params);
    return mapEventFromJson(model);
  }

  async update(id: string, params: UpdateEventParams): Promise<EventEntity> {
    const model = await this.datasource.update(id, params);
    return mapEventFromJson(model);
  }

  async cancel(id: string): Promise<EventEntity> {
    const model = await this.datasource.update(id, { status: 'cancelled' });
    return mapEventFromJson(model);
  }

  async activate(id: string): Promise<EventEntity> {
    const model = await this.datasource.update(id, { status: 'active' });
    return mapEventFromJson(model);
  }

  async feature(id: string, featured: boolean): Promise<EventEntity> {
    const model = await this.datasource.update(id, { isFeatured: featured });
    return mapEventFromJson(model);
  }

  async delete(id: string): Promise<void> {
    await this.datasource.delete(id);
  }

  async getStats(): Promise<EventStats> {
    return this.datasource.getStats();
  }
}
