import { useState, useMemo } from 'react';
import {
  useTickets,
  useUpdateTicket,
  useCancelTicket,
  useRefundTicket,
} from '../api/tickets-api';
import type { Ticket, TicketFilters, TicketStatus } from '../types/ticket';

export function useTicketsAdmin() {
  const [filters, setFilters] = useState<TicketFilters>({});

  const ticketsQuery = useTickets(filters);
  const updateTicket = useUpdateTicket();
  const cancelTicket = useCancelTicket();
  const refundTicket = useRefundTicket();

  const tickets = (ticketsQuery.data ?? []) as Ticket[];

  const ticketsByStatus = useMemo(() => {
    const grouped: Record<TicketStatus, Ticket[]> = {
      active: [],
      used: [],
      cancelled: [],
      expired: [],
      refunded: [],
    };
    tickets.forEach((t) => {
      grouped[t.status]?.push(t);
    });
    return grouped;
  }, [tickets]);

  const totalRevenue = useMemo(
    () => tickets.reduce((sum, t) => sum + t.price * t.quantity, 0),
    [tickets],
  );

  const totalSold = useMemo(
    () => tickets.reduce((sum, t) => sum + t.quantity, 0),
    [tickets],
  );

  const setStatusFilter = (status?: TicketStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  return {
    tickets,
    ticketsByStatus,
    totalRevenue,
    totalSold,
    isLoading: ticketsQuery.isLoading,
    isError: ticketsQuery.isError,
    error: ticketsQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setSearchFilter,
    setPage,
    updateTicket,
    cancelTicket,
    refundTicket,
  };
}
