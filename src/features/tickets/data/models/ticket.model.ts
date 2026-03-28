import type { TicketEntity } from '../../domain/entities/ticket.entity';

export interface TicketModel {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketTypeId: string;
  ticketTypeName: string;
  userId: string;
  userName: string;
  userEmail: string;
  price: number;
  quantity: number;
  status: string;
  qrCode?: string;
  purchasedAt: string;
  usedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapTicketFromJson(json: any): TicketEntity {
  return {
    id: json?.id ?? '',
    eventId: json?.eventId ?? '',
    eventTitle: json?.eventTitle ?? '',
    eventDate: json?.eventDate ?? '',
    eventLocation: json?.eventLocation ?? '',
    ticketTypeId: json?.ticketTypeId ?? '',
    ticketTypeName: json?.ticketTypeName ?? '',
    userId: json?.userId ?? '',
    userName: json?.userName ?? '',
    userEmail: json?.userEmail ?? '',
    price: Number(json?.price) || 0,
    quantity: Number(json?.quantity) || 0,
    status: json?.status ?? 'active',
    qrCode: json?.qrCode ?? undefined,
    purchasedAt: json?.purchasedAt ?? '',
    usedAt: json?.usedAt ?? undefined,
    cancelledAt: json?.cancelledAt ?? undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
