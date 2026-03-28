import type { TourEntity } from '../../domain/entities/tour.entity';

export interface TourModel {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  pointsOfInterest?: string[];
  isFirstParty: boolean;
  status: string;
  maxParticipants: number;
  nextAvailableDate?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapTourFromJson(json: any): TourEntity {
  return {
    id: json?.id ?? '',
    title: json?.title ?? '',
    description: json?.description ?? '',
    type: json?.type ?? '',
    duration: json?.duration ?? '',
    price: Number(json?.price) || 0,
    rating: Number(json?.rating) || 0,
    reviewCount: Number(json?.reviewCount) || 0,
    imageUrl: json?.imageUrl ?? undefined,
    pointsOfInterest: Array.isArray(json?.pointsOfInterest) ? json.pointsOfInterest : undefined,
    isFirstParty: json?.isFirstParty ?? false,
    status: json?.status ?? 'draft',
    maxParticipants: Number(json?.maxParticipants) || 0,
    nextAvailableDate: json?.nextAvailableDate ?? undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
