import type { ModerationAdminRepository } from '../../domain/repositories/moderation-admin.repository';
import type { ModerationAdminDatasource } from '../datasources/moderation-admin.datasource';
import type { ReportEntity, ReportFilters, ReportActionParams } from '../../domain/entities/report.entity';
import { mapReportFromJson } from '../models/report.model';

export class ModerationAdminRepositoryImpl {
  private datasource: ModerationAdminDatasource;
  constructor(datasource: ModerationAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: ReportFilters): Promise<ReportEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapReportFromJson) : [];
  }

  async getById(id: string): Promise<ReportEntity> {
    const model = await this.datasource.getById(id);
    return mapReportFromJson(model);
  }

  async resolveReport(params: ReportActionParams): Promise<ReportEntity> {
    const model = await this.datasource.resolveReport(params);
    return mapReportFromJson(model);
  }
}
