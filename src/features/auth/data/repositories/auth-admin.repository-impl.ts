import type { AuthAdminRepository } from '../../domain/repositories/auth-admin.repository';
import type { AuthAdminDatasource } from '../datasources/auth-admin.datasource';
import type { AdminUserEntity, AdminLoginParams, AdminAuthResponse } from '../../domain/entities/admin-user.entity';
import { mapAdminUserFromJson } from '../models/admin-user.model';

export class AuthAdminRepositoryImpl {
  private datasource: AuthAdminDatasource;
  constructor(datasource: AuthAdminDatasource) { this.datasource = datasource; }

  async login(params: AdminLoginParams): Promise<AdminAuthResponse> {
    const result = await this.datasource.login(params);
    return {
      user: mapAdminUserFromJson(result.user),
      token: result.token,
    };
  }

  async getMe(): Promise<AdminUserEntity> {
    const model = await this.datasource.getMe();
    return mapAdminUserFromJson(model);
  }
}
