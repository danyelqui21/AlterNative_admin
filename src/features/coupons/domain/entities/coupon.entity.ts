export type CouponType = 'percentage' | 'fixed_amount' | 'free_ticket';

export type CouponStatus = 'active' | 'expired' | 'disabled';

export interface CouponEntity {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minPurchaseAmount?: number;
  maxUses?: number;
  usedCount: number;
  eventId?: string;
  eventTitle?: string;
  restaurantId?: string;
  restaurantName?: string;
  status: CouponStatus;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponParams {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minPurchaseAmount?: number;
  maxUses?: number;
  eventId?: string;
  restaurantId?: string;
  startsAt: string;
  expiresAt: string;
}

export interface UpdateCouponParams extends Partial<CreateCouponParams> {
  status?: CouponStatus;
}

export interface CouponFilters {
  status?: CouponStatus;
  type?: CouponType;
  search?: string;
  page?: number;
  limit?: number;
}
