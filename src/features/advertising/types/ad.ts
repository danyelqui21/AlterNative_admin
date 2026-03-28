export type AdPlacement = 'banner' | 'feed' | 'sidebar' | 'interstitial' | 'featured';

export type AdStatus = 'draft' | 'active' | 'paused' | 'completed' | 'rejected';

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  advertiserId: string;
  advertiserName: string;
  impressions: number;
  clicks: number;
  budget: number;
  spent: number;
  targetCities?: string[];
  targetCategories?: string[];
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdRequest {
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  advertiserId: string;
  budget: number;
  targetCities?: string[];
  targetCategories?: string[];
  startsAt: string;
  expiresAt: string;
}

export interface UpdateAdRequest extends Partial<CreateAdRequest> {
  status?: AdStatus;
}

export interface AdFilters {
  status?: AdStatus;
  placement?: AdPlacement;
  search?: string;
  page?: number;
  limit?: number;
}
