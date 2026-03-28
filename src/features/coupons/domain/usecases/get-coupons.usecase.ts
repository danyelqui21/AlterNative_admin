import type { CouponEntity, CouponFilters } from '../entities/coupon.entity';

export class GetCouponsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: CouponFilters): Promise<CouponEntity[]> {
    return this.repository.getAll(filters);
  }
}
