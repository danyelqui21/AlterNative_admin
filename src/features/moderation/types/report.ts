export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export type ReportType = 'event' | 'restaurant' | 'user' | 'review' | 'clan' | 'message';

export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'fraud'
  | 'copyright'
  | 'other';

export interface Report {
  id: string;
  type: ReportType;
  reason: ReportReason;
  description?: string;
  targetId: string;
  targetType: ReportType;
  reporterId: string;
  reporterName: string;
  status: ReportStatus;
  moderatorId?: string;
  moderatorNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportAction {
  reportId: string;
  action: 'resolve' | 'dismiss';
  note?: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  type?: ReportType;
  search?: string;
  page?: number;
  limit?: number;
}
