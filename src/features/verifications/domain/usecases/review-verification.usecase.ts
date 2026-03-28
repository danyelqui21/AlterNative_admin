import type { VerificationEntity, VerificationActionParams } from '../entities/verification.entity';

export class ReviewVerificationUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: VerificationActionParams): Promise<VerificationEntity> {
    return this.repository.review(params);
  }
}
