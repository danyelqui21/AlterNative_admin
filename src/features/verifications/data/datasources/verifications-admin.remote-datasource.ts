import { apiClient } from '@/core/api/api-client';
import type { VerificationsAdminDatasource } from './verifications-admin.datasource';
import type { VerificationModel } from '../models/verification.model';
import type { VerificationFilters, VerificationActionParams } from '../../domain/entities/verification.entity';

export class VerificationsAdminRemoteDatasource {
  async getAll(filters?: VerificationFilters): Promise<VerificationModel[]> {
    const { data } = await apiClient.get('/admin/verifications', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<VerificationModel> {
    const { data } = await apiClient.get(`/admin/verifications/${id}`);
    return data?.data ?? data;
  }

  async review({ id, action, notes }: VerificationActionParams): Promise<VerificationModel> {
    const { data } = await apiClient.put(`/admin/verifications/${id}/${action}`, { notes });
    return data?.data ?? data;
  }
}
