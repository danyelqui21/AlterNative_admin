import type { CouponEntity } from '../../domain/entities/coupon.entity';

export interface CouponModel {
  id: string;
  code: string;
  description: string;
  type: string;
  value: number;
  minPurchaseAmount?: number;
  maxUses?: number;
  usedCount: number;
  eventId?: string;
  eventTitle?: string;
  restaurantId?: string;
  restaurantName?: string;
  status: string;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export function mapCouponFromJson(json: any): CouponEntity {
  return {
    id: json?.id ?? '',
    code: json?.code ?? '',
    description: json?.description ?? '',
    type: json?.type ?? 'percentage',
    value: Number(json?.value) || 0,
    minPurchaseAmount: json?.minPurchaseAmount != null ? Number(json.minPurchaseAmount) : undefined,
    maxUses: json?.maxUses != null ? Number(json.maxUses) : undefined,
    usedCount: Number(json?.usedCount) || 0,
    eventId: json?.eventId ?? undefined,
    eventTitle: json?.eventTitle ?? undefined,
    restaurantId: json?.restaurantId ?? undefined,
    restaurantName: json?.restaurantName ?? undefined,
    status: json?.status ?? 'active',
    startsAt: json?.startsAt ?? '',
    expiresAt: json?.expiresAt ?? '',
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
