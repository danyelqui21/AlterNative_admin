import type {
  RestaurantEntity,
  RestaurantFilters,
  CreateRestaurantParams,
  UpdateRestaurantParams,
} from '../entities/restaurant.entity';

export interface RestaurantsAdminRepository {
  getAll(filters?: RestaurantFilters): Promise<RestaurantEntity[]>;
  getById(id: string): Promise<RestaurantEntity>;
  create(params: CreateRestaurantParams): Promise<RestaurantEntity>;
  update(id: string, params: UpdateRestaurantParams): Promise<RestaurantEntity>;
  delete(id: string): Promise<void>;
}
