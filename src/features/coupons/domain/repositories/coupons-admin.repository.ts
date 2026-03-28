import type { CouponEntity, CouponFilters, CreateCouponParams, UpdateCouponParams } from '../entities/coupon.entity';

export interface CouponsAdminRepository {
  getAll(filters?: CouponFilters): Promise<CouponEntity[]>;
  getById(id: string): Promise<CouponEntity>;
  create(params: CreateCouponParams): Promise<CouponEntity>;
  update(id: string, params: UpdateCouponParams): Promise<CouponEntity>;
  delete(id: string): Promise<void>;
}
