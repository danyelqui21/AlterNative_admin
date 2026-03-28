import type { UserEntity } from '../../domain/entities/user.entity';

export interface UserModel {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  role: string;
  provider: string;
  avatarUrl?: string;
  interests?: string[];
  canCreateClans: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapUserFromJson(json: any): UserEntity {
  return {
    id: json?.id ?? '',
    email: json?.email ?? '',
    name: json?.name ?? '',
    phone: json?.phone ?? undefined,
    city: json?.city ?? undefined,
    role: json?.role ?? 'user',
    provider: json?.provider ?? 'local',
    avatarUrl: json?.avatarUrl ?? undefined,
    interests: Array.isArray(json?.interests) ? json.interests : undefined,
    canCreateClans: json?.canCreateClans ?? false,
    isVerified: json?.isVerified ?? false,
    isActive: json?.isActive ?? true,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
