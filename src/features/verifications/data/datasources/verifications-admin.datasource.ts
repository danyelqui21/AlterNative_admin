import type { VerificationFilters, VerificationActionParams } from '../../domain/entities/verification.entity';
import type { VerificationModel } from '../models/verification.model';

export interface VerificationsAdminDatasource {
  getAll(filters?: VerificationFilters): Promise<VerificationModel[]>;
  getById(id: string): Promise<VerificationModel>;
  review(params: VerificationActionParams): Promise<VerificationModel>;
}
