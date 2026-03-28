import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/core/api/api-client';

interface AdminStats {
  totalUsers: number;
  activeEvents: number;
  totalRestaurants: number;
  totalTours: number;
  ticketsSoldThisMonth: number;
  revenueThisMonth: number;
  pendingModerationReports: number;
  activeSubscriptions: number;
}

interface RevenueItem {
  month: string;
  revenue: number;
}

interface TicketCategory {
  name: string;
  count: number;
}

interface UserGrowthItem {
  month: string;
  count: number;
}

interface RecentEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  ticketsSold: number;
  capacity: number;
  status: string;
}

export function useDashboardAdminViewModel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueItem[]>([]);
  const [ticketsByCategory, setTicketsByCategory] = useState<TicketCategory[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, revenueRes, ticketsRes, growthRes, eventsRes] = await Promise.all([
        apiClient.get<AdminStats>('/admin/stats'),
        apiClient.get<RevenueItem[]>('/admin/revenue'),
        apiClient.get<TicketCategory[]>('/admin/tickets/by-category'),
        apiClient.get<UserGrowthItem[]>('/admin/users/growth'),
        apiClient.get<RecentEvent[]>('/admin/events'),
      ]);
      setStats(statsRes);
      setRevenueByMonth(revenueRes);
      setTicketsByCategory(ticketsRes);
      setUserGrowth(growthRes);
      setRecentEvents(eventsRes);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return {
    stats,
    revenueByMonth,
    ticketsByCategory,
    userGrowth,
    recentEvents,
    isLoading,
    error,
    refresh: loadData,
  };
}
