import type { RestaurantFilters, CreateRestaurantParams, UpdateRestaurantParams } from '../../domain/entities/restaurant.entity';
import type { RestaurantModel } from '../models/restaurant.model';

export interface RestaurantsAdminDatasource {
  getAll(filters?: RestaurantFilters): Promise<RestaurantModel[]>;
  getById(id: string): Promise<RestaurantModel>;
  create(params: CreateRestaurantParams): Promise<RestaurantModel>;
  update(id: string, params: UpdateRestaurantParams): Promise<RestaurantModel>;
  delete(id: string): Promise<void>;
}
