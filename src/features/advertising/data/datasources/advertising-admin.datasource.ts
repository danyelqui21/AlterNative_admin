import type { AdFilters, CreateAdParams, UpdateAdParams } from '../../domain/entities/ad.entity';
import type { AdModel } from '../models/ad.model';

export interface AdvertisingAdminDatasource {
  getAll(filters?: AdFilters): Promise<AdModel[]>;
  getById(id: string): Promise<AdModel>;
  create(params: CreateAdParams): Promise<AdModel>;
  update(id: string, params: UpdateAdParams): Promise<AdModel>;
  delete(id: string): Promise<void>;
}
