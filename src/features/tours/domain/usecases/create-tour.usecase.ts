import type { TourEntity, CreateTourParams } from '../entities/tour.entity';

export class CreateTourUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: CreateTourParams): Promise<TourEntity> {
    return this.repository.create(params);
  }
}
