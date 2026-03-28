import type { RestaurantEntity } from '../../domain/entities/restaurant.entity';

export interface RestaurantModel {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  priceRange: number;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  imageUrl?: string;
  phone?: string;
  isOpenNow: boolean;
  hasPromos: boolean;
  deliveryPlatforms?: string[];
  subscriptionTier: string;
  hasLiveChat: boolean;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapRestaurantFromJson(json: any): RestaurantEntity {
  return {
    id: json?.id ?? '',
    name: json?.name ?? '',
    description: json?.description ?? '',
    cuisineType: json?.cuisineType ?? '',
    priceRange: Number(json?.priceRange) || 0,
    rating: Number(json?.rating) || 0,
    reviewCount: Number(json?.reviewCount) || 0,
    address: json?.address ?? '',
    city: json?.city ?? '',
    imageUrl: json?.imageUrl ?? undefined,
    phone: json?.phone ?? undefined,
    isOpenNow: json?.isOpenNow ?? false,
    hasPromos: json?.hasPromos ?? false,
    deliveryPlatforms: Array.isArray(json?.deliveryPlatforms) ? json.deliveryPlatforms : undefined,
    subscriptionTier: json?.subscriptionTier ?? 'free',
    hasLiveChat: json?.hasLiveChat ?? false,
    ownerId: json?.ownerId ?? undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
