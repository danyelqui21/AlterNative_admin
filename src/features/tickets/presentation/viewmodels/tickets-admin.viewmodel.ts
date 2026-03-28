import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TicketEntity, TicketFilters, TicketStatus, UpdateTicketParams } from '../../domain/entities/ticket.entity';
import { TicketsAdminRepositoryImpl } from '../../data/repositories/tickets-admin.repository-impl';
import { TicketsAdminRemoteDatasource } from '../../data/datasources/tickets-admin.remote-datasource';

const datasource = new TicketsAdminRemoteDatasource();
const repository = new TicketsAdminRepositoryImpl(datasource);

export function useTicketsAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<TicketFilters>({});

  const ticketsQuery = useQuery<TicketEntity[]>({
    queryKey: ['admin-tickets', filters],
    queryFn: () => repository.getAll(filters),
  });

  const updateTicket = useMutation<TicketEntity, Error, { id: string; params: UpdateTicketParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });

  const cancelTicket = useMutation<void, Error, string>({
    mutationFn: (id) => repository.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });

  const refundTicket = useMutation<void, Error, string>({
    mutationFn: (id) => repository.refund(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });

  const tickets = (ticketsQuery.data ?? []) as TicketEntity[];

  const ticketsByStatus = useMemo(() => {
    const grouped: Record<TicketStatus, TicketEntity[]> = {
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

  const setStatusFilter = useCallback((status?: TicketStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

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
