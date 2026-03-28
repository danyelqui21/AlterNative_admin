import { useState, useMemo } from 'react';
import {
  useSubscriptions as useSubscriptionsQuery,
  useCancelSubscription,
} from '../api/subscriptions-api';
import type {
  Subscription,
  SubscriptionFilters,
  SubscriptionTier,
  SubscriptionStatus,
} from '../types/subscription';

export function useSubscriptions() {
  const [filters, setFilters] = useState<SubscriptionFilters>({});

  const subscriptionsQuery = useSubscriptionsQuery(filters);
  const cancelSubscription = useCancelSubscription();

  const subscriptions = (subscriptionsQuery.data ?? []) as Subscription[];

  const byTier = useMemo(() => {
    const grouped: Record<SubscriptionTier, Subscription[]> = {
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
    const grouped: Record<SubscriptionStatus, Subscription[]> = {
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
    () =>
      subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0),
    [subscriptions],
  );

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'active').length,
    [subscriptions],
  );

  const setTierFilter = (tier?: SubscriptionTier) =>
    setFilters((prev) => ({ ...prev, tier, page: 1 }));

  const setStatusFilter = (status?: SubscriptionStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

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
