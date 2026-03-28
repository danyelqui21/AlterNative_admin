import type { CouponEntity, UpdateCouponParams } from '../entities/coupon.entity';

export class UpdateCouponUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string, params: UpdateCouponParams): Promise<CouponEntity> {
    return this.repository.update(id, params);
  }
}
