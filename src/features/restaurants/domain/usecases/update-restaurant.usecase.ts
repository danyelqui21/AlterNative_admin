import type { RestaurantEntity, UpdateRestaurantParams } from '../entities/restaurant.entity';

export class UpdateRestaurantUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string, params: UpdateRestaurantParams): Promise<RestaurantEntity> {
    return this.repository.update(id, params);
  }
}
