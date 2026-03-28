import type { TourEntity, UpdateTourParams } from '../entities/tour.entity';

export class UpdateTourUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string, params: UpdateTourParams): Promise<TourEntity> {
    return this.repository.update(id, params);
  }
}
