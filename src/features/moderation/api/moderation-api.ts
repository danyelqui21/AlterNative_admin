import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { Report, ReportFilters, ReportAction } from '../types/report';

export function useReports(filters?: ReportFilters) {
  return useQuery<Report[]>({
    queryKey: ['admin-reports', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/moderation/reports', {
        params: filters,
      });
      return data?.data ?? data;
    },
  });
}

export function useReport(id: string) {
  return useQuery<Report>({
    queryKey: ['admin-report', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/moderation/reports/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation<Report, Error, ReportAction>({
    mutationFn: async ({ reportId, action, note }) => {
      const { data } = await api.put(
        `/admin/moderation/reports/${reportId}/${action}`,
        { note },
      );
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
}
