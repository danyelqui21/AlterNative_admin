import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { Ticket, TicketFilters, UpdateTicketRequest } from '../types/ticket';

export function useTickets(filters?: TicketFilters) {
  return useQuery<Ticket[]>({
    queryKey: ['admin-tickets', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/tickets', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useTicket(id: string) {
  return useQuery<Ticket>({
    queryKey: ['admin-ticket', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/tickets/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation<Ticket, Error, { id: string; updates: UpdateTicketRequest }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.patch(`/admin/tickets/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      qc.invalidateQueries({ queryKey: ['admin-ticket', id] });
    },
  });
}

export function useCancelTicket() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.post(`/admin/tickets/${id}/cancel`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });
}

export function useRefundTicket() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.post(`/admin/tickets/${id}/refund`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });
}
