import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { Subscription, SubscriptionFilters } from '../types/subscription';

export function useSubscriptions(filters?: SubscriptionFilters) {
  return useQuery<Subscription[]>({
    queryKey: ['admin-subscriptions', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/subscriptions', {
        params: filters,
      });
      return data?.data ?? data;
    },
  });
}

export function useSubscription(id: string) {
  return useQuery<Subscription>({
    queryKey: ['admin-subscription', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/subscriptions/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.post(`/admin/subscriptions/${id}/cancel`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
  });
}
