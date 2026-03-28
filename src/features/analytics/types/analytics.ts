export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalRestaurants: number;
  totalTicketsSold: number;
  totalRevenue: number;
  pendingReports: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  revenue: number;
}

export interface UserGrowth {
  period: string;
  newUsers: number;
  activeUsers: number;
}

export interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}
