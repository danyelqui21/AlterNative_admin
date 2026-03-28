import type { UserEntity, UserFilters, UpdateUserParams } from '../entities/user.entity';

export interface UsersAdminRepository {
  getAll(filters?: UserFilters): Promise<UserEntity[]>;
  getById(id: string): Promise<UserEntity>;
  update(id: string, params: UpdateUserParams): Promise<UserEntity>;
  deactivate(id: string): Promise<void>;
}
