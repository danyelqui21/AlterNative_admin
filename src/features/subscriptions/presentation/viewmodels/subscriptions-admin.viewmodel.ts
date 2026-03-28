import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubscriptionEntity, SubscriptionFilters, SubscriptionTier, SubscriptionStatus } from '../../domain/entities/subscription.entity';
import { SubscriptionsAdminRepositoryImpl } from '../../data/repositories/subscriptions-admin.repository-impl';
import { SubscriptionsAdminRemoteDatasource } from '../../data/datasources/subscriptions-admin.remote-datasource';

const datasource = new SubscriptionsAdminRemoteDatasource();
const repository = new SubscriptionsAdminRepositoryImpl(datasource);

export function useSubscriptionsAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<SubscriptionFilters>({});

  const subscriptionsQuery = useQuery<SubscriptionEntity[]>({
    queryKey: ['admin-subscriptions', filters],
    queryFn: () => repository.getAll(filters),
  });

  const cancelSubscription = useMutation<void, Error, string>({
    mutationFn: (id) => repository.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
  });

  const subscriptions = (subscriptionsQuery.data ?? []) as SubscriptionEntity[];

  const byTier = useMemo(() => {
    const grouped: Record<SubscriptionTier, SubscriptionEntity[]> = {
      free: [],
      basic: [],
      premium: [],
      enterprise: [],
    };
    subscriptions.forEach((s) => {
      grouped[s.tier]?.push(s);
    });
    return grouped;
  }, [subscriptions]);

  const byStatus = useMemo(() => {
    const grouped: Record<SubscriptionStatus, SubscriptionEntity[]> = {
      active: [],
      cancelled: [],
      expired: [],
      past_due: [],
    };
    subscriptions.forEach((s) => {
      grouped[s.status]?.push(s);
    });
    return grouped;
  }, [subscriptions]);

  const totalMonthlyRevenue = useMemo(
    () => subscriptions.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.amount, 0),
    [subscriptions],
  );

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'active').length,
    [subscriptions],
  );

  const setTierFilter = useCallback((tier?: SubscriptionTier) =>
    setFilters((prev) => ({ ...prev, tier, page: 1 })), []);

  const setStatusFilter = useCallback((status?: SubscriptionStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    subscriptions,
    byTier,
    byStatus,
    totalMonthlyRevenue,
    activeCount,
    isLoading: subscriptionsQuery.isLoading,
    isError: subscriptionsQuery.isError,
    error: subscriptionsQuery.error,
    filters,
    setFilters,
    setTierFilter,
    setStatusFilter,
    setSearchFilter,
    setPage,
    cancelSubscription,
  };
}
