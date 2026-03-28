import type { AdminLoginParams } from '../../domain/entities/admin-user.entity';
import type { AdminUserModel } from '../models/admin-user.model';

export interface AuthAdminDatasource {
  login(params: AdminLoginParams): Promise<{ user: AdminUserModel; token: string }>;
  getMe(): Promise<AdminUserModel>;
}
