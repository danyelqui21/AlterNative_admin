import type { AdminUserEntity, AdminLoginParams, AdminAuthResponse } from '../entities/admin-user.entity';

export interface AuthAdminRepository {
  login(params: AdminLoginParams): Promise<AdminAuthResponse>;
  getMe(): Promise<AdminUserEntity>;
}
