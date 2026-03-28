import type { RestaurantsAdminRepository } from '../../domain/repositories/restaurants-admin.repository';
import type { RestaurantsAdminDatasource } from '../datasources/restaurants-admin.datasource';
import type {
  RestaurantEntity,
  RestaurantFilters,
  CreateRestaurantParams,
  UpdateRestaurantParams,
} from '../../domain/entities/restaurant.entity';
import { mapRestaurantFromJson } from '../models/restaurant.model';

export class RestaurantsAdminRepositoryImpl {
  private datasource: RestaurantsAdminDatasource;
  constructor(datasource: RestaurantsAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: RestaurantFilters): Promise<RestaurantEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapRestaurantFromJson) : [];
  }

  async getById(id: string): Promise<RestaurantEntity> {
    const model = await this.datasource.getById(id);
    return mapRestaurantFromJson(model);
  }

  async create(params: CreateRestaurantParams): Promise<RestaurantEntity> {
    const model = await this.datasource.create(params);
    return mapRestaurantFromJson(model);
  }

  async update(id: string, params: UpdateRestaurantParams): Promise<RestaurantEntity> {
    const model = await this.datasource.update(id, params);
    return mapRestaurantFromJson(model);
  }

  async delete(id: string): Promise<void> {
    await this.datasource.delete(id);
  }
}
