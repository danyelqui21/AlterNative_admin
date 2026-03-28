import type { ToursAdminRepository } from '../../domain/repositories/tours-admin.repository';
import type { ToursAdminDatasource } from '../datasources/tours-admin.datasource';
import type { TourEntity, TourFilters, CreateTourParams, UpdateTourParams } from '../../domain/entities/tour.entity';
import { mapTourFromJson } from '../models/tour.model';

export class ToursAdminRepositoryImpl {
  private datasource: ToursAdminDatasource;
  constructor(datasource: ToursAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: TourFilters): Promise<TourEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapTourFromJson) : [];
  }

  async getById(id: string): Promise<TourEntity> {
    const model = await this.datasource.getById(id);
    return mapTourFromJson(model);
  }

  async create(params: CreateTourParams): Promise<TourEntity> {
    const model = await this.datasource.create(params);
    return mapTourFromJson(model);
  }

  async update(id: string, params: UpdateTourParams): Promise<TourEntity> {
    const model = await this.datasource.update(id, params);
    return mapTourFromJson(model);
  }

  async delete(id: string): Promise<void> {
    await this.datasource.delete(id);
  }
}
