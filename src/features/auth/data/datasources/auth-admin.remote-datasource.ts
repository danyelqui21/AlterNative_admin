import { apiClient } from '@/core/api/api-client';
import type { AuthAdminDatasource } from './auth-admin.datasource';
import type { AdminUserModel } from '../models/admin-user.model';
import type { AdminLoginParams } from '../../domain/entities/admin-user.entity';

export class AuthAdminRemoteDatasource {
  async login(params: AdminLoginParams): Promise<{ user: AdminUserModel; token: string }> {
    const { data } = await apiClient.post('/auth/login', { ...params, appName: 'LagunApp Admin' });
    return data;
  }

  async getMe(): Promise<AdminUserModel> {
    const { data } = await apiClient.get('/auth/me');
    return data?.data ?? data;
  }
}
