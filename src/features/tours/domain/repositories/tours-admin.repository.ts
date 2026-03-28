import type { TourEntity, TourFilters, CreateTourParams, UpdateTourParams } from '../entities/tour.entity';

export interface ToursAdminRepository {
  getAll(filters?: TourFilters): Promise<TourEntity[]>;
  getById(id: string): Promise<TourEntity>;
  create(params: CreateTourParams): Promise<TourEntity>;
  update(id: string, params: UpdateTourParams): Promise<TourEntity>;
  delete(id: string): Promise<void>;
}
