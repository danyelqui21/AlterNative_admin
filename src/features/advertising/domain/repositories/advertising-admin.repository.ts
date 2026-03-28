import type { AdEntity, AdFilters, CreateAdParams, UpdateAdParams } from '../entities/ad.entity';

export interface AdvertisingAdminRepository {
  getAll(filters?: AdFilters): Promise<AdEntity[]>;
  getById(id: string): Promise<AdEntity>;
  create(params: CreateAdParams): Promise<AdEntity>;
  update(id: string, params: UpdateAdParams): Promise<AdEntity>;
  delete(id: string): Promise<void>;
}
