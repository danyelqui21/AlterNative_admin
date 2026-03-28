import type { AdminUserEntity } from '../../domain/entities/admin-user.entity';

export interface AdminUserModel {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapAdminUserFromJson(json: any): AdminUserEntity {
  return {
    id: json?.id ?? '',
    email: json?.email ?? '',
    name: json?.name ?? '',
    role: 'admin',
    avatarUrl: json?.avatarUrl ?? undefined,
    isActive: json?.isActive ?? true,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
