import type { AdEntity, CreateAdParams } from '../entities/ad.entity';

export class CreateAdUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: CreateAdParams): Promise<AdEntity> {
    return this.repository.create(params);
  }
}
