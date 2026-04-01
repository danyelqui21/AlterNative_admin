export interface TheaterEntity {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl?: string;
  phone?: string;
  managerId: string;
  capacity: number;
  isActive: boolean;
  layouts?: SeatingLayoutEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface SeatingLayoutEntity {
  id: string;
  theaterId: string;
  name: string;
  description?: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundUrl?: string;
  seats?: SeatEntity[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeatEntity {
  id?: string;
  label: string;
  sectionName?: string;
  rowName?: string;
  seatNumber?: number;
  posX: number;
  posY: number;
  angle: number;
  color: string;
  backgroundColor?: string;
  seatType: string;
  price?: number;
  isActive?: boolean;
}

export type SeatingMode = 'numbered' | 'general';

export interface TheaterEventEntity {
  id: string;
  eventId: string;
  theaterId: string;
  layoutId?: string;
  seatingMode: SeatingMode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTheaterParams {
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl?: string;
  phone?: string;
  managerId: string;
}

export interface UpdateTheaterParams extends Partial<CreateTheaterParams> {}

export interface CreateLayoutParams {
  name: string;
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundUrl?: string;
}

export interface TheaterFilters {
  search?: string;
  city?: string;
  page?: number;
  limit?: number;
}
