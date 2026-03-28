import { apiClient } from '@/core/api/api-client';
import type { ModerationAdminDatasource } from './moderation-admin.datasource';
import type { ReportModel } from '../models/report.model';
import type { ReportFilters, ReportActionParams } from '../../domain/entities/report.entity';

export class ModerationAdminRemoteDatasource {
  async getAll(filters?: ReportFilters): Promise<ReportModel[]> {
    const { data } = await apiClient.get('/admin/moderation/reports', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<ReportModel> {
    const { data } = await apiClient.get(`/admin/moderation/reports/${id}`);
    return data?.data ?? data;
  }

  async resolveReport({ reportId, action, note }: ReportActionParams): Promise<ReportModel> {
    const { data } = await apiClient.put(`/admin/moderation/reports/${reportId}/${action}`, { note });
    return data?.data ?? data;
  }
}
