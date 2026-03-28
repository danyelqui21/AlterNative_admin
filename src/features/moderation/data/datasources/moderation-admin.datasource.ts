import type { ReportFilters, ReportActionParams } from '../../domain/entities/report.entity';
import type { ReportModel } from '../models/report.model';

export interface ModerationAdminDatasource {
  getAll(filters?: ReportFilters): Promise<ReportModel[]>;
  getById(id: string): Promise<ReportModel>;
  resolveReport(params: ReportActionParams): Promise<ReportModel>;
}
