import type { AdEntity } from '../../domain/entities/ad.entity';

export interface AdModel {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  status: string;
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

export function mapAdFromJson(json: any): AdEntity {
  return {
    id: json?.id ?? '',
    title: json?.title ?? '',
    description: json?.description ?? '',
    imageUrl: json?.imageUrl ?? '',
    targetUrl: json?.targetUrl ?? '',
    placement: json?.placement ?? 'banner',
    status: json?.status ?? 'draft',
    advertiserId: json?.advertiserId ?? '',
    advertiserName: json?.advertiserName ?? '',
    impressions: Number(json?.impressions) || 0,
    clicks: Number(json?.clicks) || 0,
    budget: Number(json?.budget) || 0,
    spent: Number(json?.spent) || 0,
    targetCities: Array.isArray(json?.targetCities) ? json.targetCities : undefined,
    targetCategories: Array.isArray(json?.targetCategories) ? json.targetCategories : undefined,
    startsAt: json?.startsAt ?? '',
    expiresAt: json?.expiresAt ?? '',
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
