import { useState, useMemo } from 'react';
import { useReports, useResolveReport } from '../api/moderation-api';
import type { Report, ReportFilters, ReportStatus, ReportType } from '../types/report';

export function useModeration() {
  const [filters, setFilters] = useState<ReportFilters>({});

  const reportsQuery = useReports(filters);
  const resolveReport = useResolveReport();

  const reports = (reportsQuery.data ?? []) as Report[];

  const reportsByStatus = useMemo(() => {
    const grouped: Record<ReportStatus, Report[]> = {
      pending: [],
      reviewed: [],
      resolved: [],
      dismissed: [],
    };
    reports.forEach((r) => {
      grouped[r.status]?.push(r);
    });
    return grouped;
  }, [reports]);

  const pendingCount = useMemo(
    () => reportsByStatus.pending.length,
    [reportsByStatus],
  );

  const reportsByType = useMemo(() => {
    const grouped: Record<string, Report[]> = {};
    reports.forEach((r) => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });
    return grouped;
  }, [reports]);

  const setStatusFilter = (status?: ReportStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setTypeFilter = (type?: ReportType) =>
    setFilters((prev) => ({ ...prev, type, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  return {
    reports,
    reportsByStatus,
    reportsByType,
    pendingCount,
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setTypeFilter,
    setSearchFilter,
    setPage,
    resolveReport,
  };
}
