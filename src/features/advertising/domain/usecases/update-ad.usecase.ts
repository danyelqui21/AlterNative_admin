import type { AdEntity, UpdateAdParams } from '../entities/ad.entity';

export class UpdateAdUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string, params: UpdateAdParams): Promise<AdEntity> {
    return this.repository.update(id, params);
  }
}
