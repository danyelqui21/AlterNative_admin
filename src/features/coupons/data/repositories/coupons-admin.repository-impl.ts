import type { CouponsAdminRepository } from '../../domain/repositories/coupons-admin.repository';
import type { CouponsAdminDatasource } from '../datasources/coupons-admin.datasource';
import type { CouponEntity, CouponFilters, CreateCouponParams, UpdateCouponParams } from '../../domain/entities/coupon.entity';
import { mapCouponFromJson } from '../models/coupon.model';

export class CouponsAdminRepositoryImpl {
  private datasource: CouponsAdminDatasource;
  constructor(datasource: CouponsAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: CouponFilters): Promise<CouponEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapCouponFromJson) : [];
  }

  async getById(id: string): Promise<CouponEntity> {
    const model = await this.datasource.getById(id);
    return mapCouponFromJson(model);
  }

  async create(params: CreateCouponParams): Promise<CouponEntity> {
    const model = await this.datasource.create(params);
    return mapCouponFromJson(model);
  }

  async update(id: string, params: UpdateCouponParams): Promise<CouponEntity> {
    const model = await this.datasource.update(id, params);
    return mapCouponFromJson(model);
  }

  async delete(id: string): Promise<void> {
    await this.datasource.delete(id);
  }
}
