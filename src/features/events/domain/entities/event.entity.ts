export type EventStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface TicketTypeEntity {
  id: string;
  eventId: string;
  name: string;
  price: number;
  available: boolean;
  maxQuantity: number;
}

export interface EventEntity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  city: string;
  price: number;
  imageUrl?: string;
  isPlusEighteen: boolean;
  isFeatured: boolean;
  organizerId: string;
  capacity: number;
  ticketsSold: number;
  status: EventStatus;
  ticketTypes: TicketTypeEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventParams {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  city: string;
  price: number;
  imageUrl?: string;
  isPlusEighteen?: boolean;
  isFeatured?: boolean;
  capacity: number;
  ticketTypes?: Omit<TicketTypeEntity, 'id' | 'eventId'>[];
}

export interface UpdateEventParams extends Partial<CreateEventParams> {
  status?: EventStatus;
}

export interface EventFilters {
  status?: EventStatus;
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}
