import { apiClient } from '@/core/api/api-client';
import type { UsersAdminDatasource } from './users-admin.datasource';
import type { UserModel } from '../models/user.model';
import type { UserFilters, UpdateUserParams } from '../../domain/entities/user.entity';

export class UsersAdminRemoteDatasource {
  async getAll(filters?: UserFilters): Promise<UserModel[]> {
    const { data } = await apiClient.get('/admin/users', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<UserModel> {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateUserParams): Promise<UserModel> {
    const { data } = await apiClient.put(`/admin/users/${id}`, params);
    return data?.data ?? data;
  }

  async deactivate(id: string): Promise<void> {
    await apiClient.put(`/admin/users/${id}`, { isActive: false });
  }
}
