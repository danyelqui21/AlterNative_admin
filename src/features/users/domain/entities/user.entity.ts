export type UserRole = 'user' | 'restaurant' | 'organizer' | 'scanner_staff' | 'admin';

export type AuthProvider = 'local' | 'google' | 'apple' | 'facebook' | 'discord';

export interface UserEntity {
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

export interface UpdateUserParams {
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
