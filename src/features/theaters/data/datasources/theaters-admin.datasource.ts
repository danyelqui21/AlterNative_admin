import type { TheaterFilters, CreateTheaterParams, UpdateTheaterParams, CreateLayoutParams, SeatEntity } from '../../domain/entities/theater.entity';
import type { TheaterModel } from '../models/theater.model';

export interface TheatersAdminDatasource {
  getAll(filters?: TheaterFilters): Promise<TheaterModel[]>;
  getById(id: string): Promise<TheaterModel>;
  create(params: CreateTheaterParams): Promise<TheaterModel>;
  update(id: string, params: UpdateTheaterParams): Promise<TheaterModel>;
  enable(id: string): Promise<TheaterModel>;
  disable(id: string): Promise<TheaterModel>;
  getLayout(theaterId: string, layoutId: string): Promise<any>;
  createLayout(theaterId: string, params: CreateLayoutParams): Promise<any>;
  updateLayout(theaterId: string, layoutId: string, params: Partial<CreateLayoutParams>): Promise<any>;
  bulkUpsertSeats(theaterId: string, layoutId: string, seats: SeatEntity[]): Promise<any[]>;
}
