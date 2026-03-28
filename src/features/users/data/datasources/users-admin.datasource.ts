import type { UserFilters, UpdateUserParams } from '../../domain/entities/user.entity';
import type { UserModel } from '../models/user.model';

export interface UsersAdminDatasource {
  getAll(filters?: UserFilters): Promise<UserModel[]>;
  getById(id: string): Promise<UserModel>;
  update(id: string, params: UpdateUserParams): Promise<UserModel>;
  deactivate(id: string): Promise<void>;
}
