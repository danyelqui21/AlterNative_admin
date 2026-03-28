import { useState, useMemo } from 'react';
import {
  useDashboardStats,
  useUserGrowth,
  useRevenueTimeSeries,
  useCategoryBreakdown,
  useRevenueBreakdown,
} from '../api/analytics-api';
import type { AnalyticsFilters } from '../types/analytics';

export function useAnalytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'month',
  });

  const statsQuery = useDashboardStats();
  const userGrowthQuery = useUserGrowth(filters);
  const revenueTimeSeriesQuery = useRevenueTimeSeries(filters);
  const categoryBreakdownQuery = useCategoryBreakdown();
  const revenueBreakdownQuery = useRevenueBreakdown();

  const stats = statsQuery.data ?? null;

  const topCategory = useMemo(() => {
    const categories = categoryBreakdownQuery.data ?? [];
    if (categories.length === 0) return null;
    return [...categories].sort((a, b) => b.revenue - a.revenue)[0];
  }, [categoryBreakdownQuery.data]);

  const totalRevenueFromBreakdown = useMemo(() => {
    const breakdown = revenueBreakdownQuery.data ?? [];
    return breakdown.reduce((sum, b) => sum + b.amount, 0);
  }, [revenueBreakdownQuery.data]);

  const setPeriod = (period: AnalyticsFilters['period']) =>
    setFilters((prev) => ({ ...prev, period }));

  const setDateRange = (dateFrom?: string, dateTo?: string) =>
    setFilters((prev) => ({ ...prev, dateFrom, dateTo }));

  const isLoading =
    statsQuery.isLoading ||
    userGrowthQuery.isLoading ||
    revenueTimeSeriesQuery.isLoading;

  return {
    stats,
    userGrowth: userGrowthQuery.data ?? [],
    revenueTimeSeries: revenueTimeSeriesQuery.data ?? [],
    categoryBreakdown: categoryBreakdownQuery.data ?? [],
    revenueBreakdown: revenueBreakdownQuery.data ?? [],
    topCategory,
    totalRevenueFromBreakdown,
    isLoading,
    filters,
    setFilters,
    setPeriod,
    setDateRange,
  };
}
