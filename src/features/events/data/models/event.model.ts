import type { EventEntity, TicketTypeEntity } from '../../domain/entities/event.entity';

export interface EventModel {
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
  status: string;
  ticketTypes: TicketTypeModel[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypeModel {
  id: string;
  eventId: string;
  name: string;
  price: number;
  available: boolean;
  maxQuantity: number;
}

function mapTicketTypeFromJson(json: any): TicketTypeEntity {
  return {
    id: json?.id ?? '',
    eventId: json?.eventId ?? '',
    name: json?.name ?? '',
    price: Number(json?.price) || 0,
    available: json?.available ?? true,
    maxQuantity: Number(json?.maxQuantity) || 0,
  };
}

export function mapEventFromJson(json: any): EventEntity {
  return {
    id: json?.id ?? '',
    title: json?.title ?? '',
    description: json?.description ?? '',
    category: json?.category ?? '',
    date: json?.date ?? '',
    time: json?.time ?? '',
    location: json?.location ?? '',
    city: json?.city ?? '',
    price: Number(json?.price) || 0,
    imageUrl: json?.imageUrl ?? undefined,
    isPlusEighteen: json?.isPlusEighteen ?? false,
    isFeatured: json?.isFeatured ?? false,
    organizerId: json?.organizerId ?? '',
    capacity: Number(json?.capacity) || 0,
    ticketsSold: Number(json?.ticketsSold) || 0,
    status: json?.status ?? 'draft',
    ticketTypes: Array.isArray(json?.ticketTypes)
      ? json.ticketTypes.map(mapTicketTypeFromJson)
      : [],
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
