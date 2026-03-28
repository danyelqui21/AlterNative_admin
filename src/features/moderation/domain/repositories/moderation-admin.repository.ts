import type { ReportEntity, ReportFilters, ReportActionParams } from '../entities/report.entity';

export interface ModerationAdminRepository {
  getAll(filters?: ReportFilters): Promise<ReportEntity[]>;
  getById(id: string): Promise<ReportEntity>;
  resolveReport(params: ReportActionParams): Promise<ReportEntity>;
}
