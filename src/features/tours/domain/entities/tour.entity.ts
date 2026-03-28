export type TourStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface TourEntity {
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
  status: TourStatus;
  maxParticipants: number;
  nextAvailableDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourParams {
  title: string;
  description: string;
  type: string;
  duration: string;
  price: number;
  imageUrl?: string;
  pointsOfInterest?: string[];
  isFirstParty?: boolean;
  maxParticipants: number;
}

export interface UpdateTourParams extends Partial<CreateTourParams> {
  status?: TourStatus;
}

export interface TourFilters {
  status?: TourStatus;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}
