import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  VerificationEntity,
  VerificationFilters,
  VerificationStatus,
  VerificationType,
  VerificationActionParams,
} from '../../domain/entities/verification.entity';
import { VerificationsAdminRepositoryImpl } from '../../data/repositories/verifications-admin.repository-impl';
import { VerificationsAdminRemoteDatasource } from '../../data/datasources/verifications-admin.remote-datasource';

const datasource = new VerificationsAdminRemoteDatasource();
const repository = new VerificationsAdminRepositoryImpl(datasource);

export function useVerificationsAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<VerificationFilters>({});

  const verificationsQuery = useQuery<VerificationEntity[]>({
    queryKey: ['admin-verifications', filters],
    queryFn: () => repository.getAll(filters),
  });

  const reviewVerification = useMutation<VerificationEntity, Error, VerificationActionParams>({
    mutationFn: (params) => repository.review(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-verifications'] });
    },
  });

  const verifications = (verificationsQuery.data ?? []) as VerificationEntity[];

  const byStatus = useMemo(() => {
    const grouped: Record<VerificationStatus, VerificationEntity[]> = {
      pending: [],
      approved: [],
      rejected: [],
    };
    verifications.forEach((v) => {
      grouped[v.status]?.push(v);
    });
    return grouped;
  }, [verifications]);

  const pendingCount = useMemo(() => byStatus.pending.length, [byStatus]);

  const byType = useMemo(() => {
    const grouped: Record<string, VerificationEntity[]> = {};
    verifications.forEach((v) => {
      if (!grouped[v.type]) grouped[v.type] = [];
      grouped[v.type].push(v);
    });
    return grouped;
  }, [verifications]);

  const setStatusFilter = useCallback((status?: VerificationStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setTypeFilter = useCallback((type?: VerificationType) =>
    setFilters((prev) => ({ ...prev, type, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    verifications,
    byStatus,
    byType,
    pendingCount,
    isLoading: verificationsQuery.isLoading,
    isError: verificationsQuery.isError,
    error: verificationsQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setTypeFilter,
    setSearchFilter,
    setPage,
    reviewVerification,
  };
}
