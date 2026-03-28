import type { TourEntity, TourFilters } from '../entities/tour.entity';

export class GetToursUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: TourFilters): Promise<TourEntity[]> {
    return this.repository.getAll(filters);
  }
}
