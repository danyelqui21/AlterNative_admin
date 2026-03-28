import type { CouponEntity, CreateCouponParams } from '../entities/coupon.entity';

export class CreateCouponUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: CreateCouponParams): Promise<CouponEntity> {
    return this.repository.create(params);
  }
}
