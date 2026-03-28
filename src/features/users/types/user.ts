export type UserRole = 'user' | 'restaurant' | 'organizer' | 'scanner_staff' | 'admin';

export type AuthProvider = 'local' | 'google' | 'apple' | 'facebook' | 'discord';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  role: UserRole;
  provider: AuthProvider;
  avatarUrl?: string;
  interests?: string[];
  canCreateClans: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  city?: string;
  isVerified?: boolean;
  isActive?: boolean;
  canCreateClans?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
