import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  Event,
  EventFilters,
  CreateEventRequest,
  UpdateEventRequest,
} from '../types/event';

export function useEvents(filters?: EventFilters) {
  return useQuery<Event[]>({
    queryKey: ['admin-events', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/events', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useEvent(id: string) {
  return useQuery<Event>({
    queryKey: ['admin-event', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/events/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation<Event, Error, CreateEventRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/events', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation<Event, Error, { id: string; updates: UpdateEventRequest }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/events/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      qc.invalidateQueries({ queryKey: ['admin-event', id] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/events/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}
