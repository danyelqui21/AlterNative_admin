export type TicketStatus = 'active' | 'used' | 'cancelled' | 'expired' | 'refunded';

export interface TicketEntity {
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
  status: TicketStatus;
  qrCode?: string;
  purchasedAt: string;
  usedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  eventId?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface UpdateTicketParams {
  status?: TicketStatus;
}
