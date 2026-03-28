import type { ReportEntity } from '../../domain/entities/report.entity';

export interface ReportModel {
  id: string;
  type: string;
  reason: string;
  description?: string;
  targetId: string;
  targetType: string;
  reporterId: string;
  reporterName: string;
  status: string;
  moderatorId?: string;
  moderatorNote?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapReportFromJson(json: any): ReportEntity {
  return {
    id: json?.id ?? '',
    type: json?.type ?? 'user',
    reason: json?.reason ?? 'other',
    description: json?.description ?? undefined,
    targetId: json?.targetId ?? '',
    targetType: json?.targetType ?? 'user',
    reporterId: json?.reporterId ?? '',
    reporterName: json?.reporterName ?? '',
    status: json?.status ?? 'pending',
    moderatorId: json?.moderatorId ?? undefined,
    moderatorNote: json?.moderatorNote ?? undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
