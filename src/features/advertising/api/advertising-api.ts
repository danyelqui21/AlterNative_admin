import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { Ad, AdFilters, CreateAdRequest, UpdateAdRequest } from '../types/ad';

export function useAds(filters?: AdFilters) {
  return useQuery<Ad[]>({
    queryKey: ['admin-ads', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/advertising', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useAd(id: string) {
  return useQuery<Ad>({
    queryKey: ['admin-ad', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/advertising/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation<Ad, Error, CreateAdRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/advertising', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ads'] });
    },
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation<Ad, Error, { id: string; updates: UpdateAdRequest }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/advertising/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-ads'] });
      qc.invalidateQueries({ queryKey: ['admin-ad', id] });
    },
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/advertising/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ads'] });
    },
  });
}
