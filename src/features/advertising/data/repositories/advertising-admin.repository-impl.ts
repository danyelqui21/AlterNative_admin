import type { AdvertisingAdminRepository } from '../../domain/repositories/advertising-admin.repository';
import type { AdvertisingAdminDatasource } from '../datasources/advertising-admin.datasource';
import type { AdEntity, AdFilters, CreateAdParams, UpdateAdParams } from '../../domain/entities/ad.entity';
import { mapAdFromJson } from '../models/ad.model';

export class AdvertisingAdminRepositoryImpl {
  private datasource: AdvertisingAdminDatasource;
  constructor(datasource: AdvertisingAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: AdFilters): Promise<AdEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapAdFromJson) : [];
  }

  async getById(id: string): Promise<AdEntity> {
    const model = await this.datasource.getById(id);
    return mapAdFromJson(model);
  }

  async create(params: CreateAdParams): Promise<AdEntity> {
    const model = await this.datasource.create(params);
    return mapAdFromJson(model);
  }

  async update(id: string, params: UpdateAdParams): Promise<AdEntity> {
    const model = await this.datasource.update(id, params);
    return mapAdFromJson(model);
  }

  async delete(id: string): Promise<void> {
    await this.datasource.delete(id);
  }
}
