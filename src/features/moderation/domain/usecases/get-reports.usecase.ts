import type { ReportEntity, ReportFilters } from '../entities/report.entity';

export class GetReportsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: ReportFilters): Promise<ReportEntity[]> {
    return this.repository.getAll(filters);
  }
}
