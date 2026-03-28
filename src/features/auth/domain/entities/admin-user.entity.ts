export interface AdminUserEntity {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginParams {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  user: AdminUserEntity;
  token: string;
}
