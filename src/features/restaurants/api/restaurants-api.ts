import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  Restaurant,
  RestaurantFilters,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
} from '../types/restaurant';

export function useRestaurants(filters?: RestaurantFilters) {
  return useQuery<Restaurant[]>({
    queryKey: ['admin-restaurants', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/restaurants', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useRestaurant(id: string) {
  return useQuery<Restaurant>({
    queryKey: ['admin-restaurant', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/restaurants/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateRestaurant() {
  const qc = useQueryClient();
  return useMutation<Restaurant, Error, CreateRestaurantRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/restaurants', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });
}

export function useUpdateRestaurant() {
  const qc = useQueryClient();
  return useMutation<
    Restaurant,
    Error,
    { id: string; updates: UpdateRestaurantRequest }
  >({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/restaurants/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
      qc.invalidateQueries({ queryKey: ['admin-restaurant', id] });
    },
  });
}

export function useDeleteRestaurant() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/restaurants/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });
}
