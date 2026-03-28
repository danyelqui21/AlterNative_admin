import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  Tour,
  TourFilters,
  CreateTourRequest,
  UpdateTourRequest,
} from '../types/tour';

export function useTours(filters?: TourFilters) {
  return useQuery<Tour[]>({
    queryKey: ['admin-tours', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/tours', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useTour(id: string) {
  return useQuery<Tour>({
    queryKey: ['admin-tour', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/tours/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateTour() {
  const qc = useQueryClient();
  return useMutation<Tour, Error, CreateTourRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/tours', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tours'] });
    },
  });
}

export function useUpdateTour() {
  const qc = useQueryClient();
  return useMutation<Tour, Error, { id: string; updates: UpdateTourRequest }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/tours/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-tours'] });
      qc.invalidateQueries({ queryKey: ['admin-tour', id] });
    },
  });
}

export function useDeleteTour() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/tours/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tours'] });
    },
  });
}
