export interface Restaurant {
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

export interface CreateRestaurantRequest {
  name: string;
  description: string;
  cuisineType: string;
  priceRange: number;
  address: string;
  city: string;
  imageUrl?: string;
  phone?: string;
  ownerId?: string;
}

export interface UpdateRestaurantRequest extends Partial<CreateRestaurantRequest> {
  hasPromos?: boolean;
  subscriptionTier?: string;
  hasLiveChat?: boolean;
}

export interface RestaurantFilters {
  cuisine?: string;
  city?: string;
  subscriptionTier?: string;
  search?: string;
  page?: number;
  limit?: number;
}
