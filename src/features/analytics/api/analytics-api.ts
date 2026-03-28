import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  DashboardStats,
  TimeSeriesPoint,
  CategoryBreakdown,
  UserGrowth,
  RevenueBreakdown,
  AnalyticsFilters,
} from '../types/analytics';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/dashboard');
      return data?.data ?? data;
    },
  });
}

export function useUserGrowth(filters?: AnalyticsFilters) {
  return useQuery<UserGrowth[]>({
    queryKey: ['admin-user-growth', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/users/growth', {
        params: filters,
      });
      return data?.data ?? data;
    },
  });
}

export function useRevenueTimeSeries(filters?: AnalyticsFilters) {
  return useQuery<TimeSeriesPoint[]>({
    queryKey: ['admin-revenue-timeseries', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/revenue/timeseries', {
        params: filters,
      });
      return data?.data ?? data;
    },
  });
}

export function useCategoryBreakdown() {
  return useQuery<CategoryBreakdown[]>({
    queryKey: ['admin-category-breakdown'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/events/categories');
      return data?.data ?? data;
    },
  });
}

export function useRevenueBreakdown() {
  return useQuery<RevenueBreakdown[]>({
    queryKey: ['admin-revenue-breakdown'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/revenue/breakdown');
      return data?.data ?? data;
    },
  });
}
