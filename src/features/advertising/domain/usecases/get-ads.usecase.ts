import type { AdEntity, AdFilters } from '../entities/ad.entity';

export class GetAdsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: AdFilters): Promise<AdEntity[]> {
    return this.repository.getAll(filters);
  }
}
