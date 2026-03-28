import type { VerificationEntity, VerificationFilters } from '../entities/verification.entity';

export class GetVerificationsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: VerificationFilters): Promise<VerificationEntity[]> {
    return this.repository.getAll(filters);
  }
}
