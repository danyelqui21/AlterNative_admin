import type { TourFilters, CreateTourParams, UpdateTourParams } from '../../domain/entities/tour.entity';
import type { TourModel } from '../models/tour.model';

export interface ToursAdminDatasource {
  getAll(filters?: TourFilters): Promise<TourModel[]>;
  getById(id: string): Promise<TourModel>;
  create(params: CreateTourParams): Promise<TourModel>;
  update(id: string, params: UpdateTourParams): Promise<TourModel>;
  delete(id: string): Promise<void>;
}
