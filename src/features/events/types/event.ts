export type EventStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  available: boolean;
  maxQuantity: number;
}

export interface Event {
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
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
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
  ticketTypes?: Omit<TicketType, 'id' | 'eventId'>[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
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
