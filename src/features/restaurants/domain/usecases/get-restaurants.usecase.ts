import type { RestaurantEntity, RestaurantFilters } from '../entities/restaurant.entity';

export class GetRestaurantsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: RestaurantFilters): Promise<RestaurantEntity[]> {
    return this.repository.getAll(filters);
  }
}
