import type { RestaurantEntity, CreateRestaurantParams } from '../entities/restaurant.entity';

export class CreateRestaurantUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: CreateRestaurantParams): Promise<RestaurantEntity> {
    return this.repository.create(params);
  }
}
