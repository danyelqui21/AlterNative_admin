import type { VerificationsAdminRepository } from '../../domain/repositories/verifications-admin.repository';
import type { VerificationsAdminDatasource } from '../datasources/verifications-admin.datasource';
import type { VerificationEntity, VerificationFilters, VerificationActionParams } from '../../domain/entities/verification.entity';
import { mapVerificationFromJson } from '../models/verification.model';

export class VerificationsAdminRepositoryImpl {
  private datasource: VerificationsAdminDatasource;
  constructor(datasource: VerificationsAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: VerificationFilters): Promise<VerificationEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapVerificationFromJson) : [];
  }

  async getById(id: string): Promise<VerificationEntity> {
    const model = await this.datasource.getById(id);
    return mapVerificationFromJson(model);
  }

  async review(params: VerificationActionParams): Promise<VerificationEntity> {
    const model = await this.datasource.review(params);
    return mapVerificationFromJson(model);
  }
}
