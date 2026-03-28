export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  user: AdminUser;
  token: string;
}
