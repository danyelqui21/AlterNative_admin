import type { VerificationEntity, VerificationFilters, VerificationActionParams } from '../entities/verification.entity';

export interface VerificationsAdminRepository {
  getAll(filters?: VerificationFilters): Promise<VerificationEntity[]>;
  getById(id: string): Promise<VerificationEntity>;
  review(params: VerificationActionParams): Promise<VerificationEntity>;
}
