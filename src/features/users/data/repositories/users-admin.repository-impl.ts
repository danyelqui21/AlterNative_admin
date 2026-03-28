import type { UsersAdminRepository } from '../../domain/repositories/users-admin.repository';
import type { UsersAdminDatasource } from '../datasources/users-admin.datasource';
import type { UserEntity, UserFilters, UpdateUserParams } from '../../domain/entities/user.entity';
import { mapUserFromJson } from '../models/user.model';

export class UsersAdminRepositoryImpl {
  private datasource: UsersAdminDatasource;
  constructor(datasource: UsersAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: UserFilters): Promise<UserEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapUserFromJson) : [];
  }

  async getById(id: string): Promise<UserEntity> {
    const model = await this.datasource.getById(id);
    return mapUserFromJson(model);
  }

  async update(id: string, params: UpdateUserParams): Promise<UserEntity> {
    const model = await this.datasource.update(id, params);
    return mapUserFromJson(model);
  }

  async deactivate(id: string): Promise<void> {
    await this.datasource.deactivate(id);
  }
}
