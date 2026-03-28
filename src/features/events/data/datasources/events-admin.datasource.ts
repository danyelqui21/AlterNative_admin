import type { EventFilters, CreateEventParams, UpdateEventParams } from '../../domain/entities/event.entity';
import type { EventModel } from '../models/event.model';

export interface EventsAdminDatasource {
  getAll(filters?: EventFilters): Promise<EventModel[]>;
  getById(id: string): Promise<EventModel>;
  create(params: CreateEventParams): Promise<EventModel>;
  update(id: string, params: UpdateEventParams): Promise<EventModel>;
  delete(id: string): Promise<void>;
  getStats(): Promise<{ totalEvents: number; activeEvents: number; totalTicketsSold: number; totalRevenue: number }>;
}
