import type { ReportEntity, ReportActionParams } from '../entities/report.entity';

export class ResolveReportUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: ReportActionParams): Promise<ReportEntity> {
    return this.repository.resolveReport(params);
  }
}
