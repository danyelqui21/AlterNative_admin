import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReportEntity, ReportFilters, ReportStatus, ReportType, ReportActionParams } from '../../domain/entities/report.entity';
import { ModerationAdminRepositoryImpl } from '../../data/repositories/moderation-admin.repository-impl';
import { ModerationAdminRemoteDatasource } from '../../data/datasources/moderation-admin.remote-datasource';

const datasource = new ModerationAdminRemoteDatasource();
const repository = new ModerationAdminRepositoryImpl(datasource);

export function useModerationAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<ReportFilters>({});

  const reportsQuery = useQuery<ReportEntity[]>({
    queryKey: ['admin-reports', filters],
    queryFn: () => repository.getAll(filters),
  });

  const resolveReport = useMutation<ReportEntity, Error, ReportActionParams>({
    mutationFn: (params) => repository.resolveReport(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  const reports = (reportsQuery.data ?? []) as ReportEntity[];

  const reportsByStatus = useMemo(() => {
    const grouped: Record<ReportStatus, ReportEntity[]> = {
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

  const pendingCount = useMemo(() => reportsByStatus.pending.length, [reportsByStatus]);

  const reportsByType = useMemo(() => {
    const grouped: Record<string, ReportEntity[]> = {};
    reports.forEach((r) => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });
    return grouped;
  }, [reports]);

  const setStatusFilter = useCallback((status?: ReportStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setTypeFilter = useCallback((type?: ReportType) =>
    setFilters((prev) => ({ ...prev, type, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

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
