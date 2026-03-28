import type { CouponFilters, CreateCouponParams, UpdateCouponParams } from '../../domain/entities/coupon.entity';
import type { CouponModel } from '../models/coupon.model';

export interface CouponsAdminDatasource {
  getAll(filters?: CouponFilters): Promise<CouponModel[]>;
  getById(id: string): Promise<CouponModel>;
  create(params: CreateCouponParams): Promise<CouponModel>;
  update(id: string, params: UpdateCouponParams): Promise<CouponModel>;
  delete(id: string): Promise<void>;
}
