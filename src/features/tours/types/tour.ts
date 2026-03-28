export type TourStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Tour {
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

export interface CreateTourRequest {
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

export interface UpdateTourRequest extends Partial<CreateTourRequest> {
  status?: TourStatus;
}

export interface TourFilters {
  status?: TourStatus;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}
