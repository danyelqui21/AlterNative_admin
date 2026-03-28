import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdEntity, AdFilters, AdStatus, CreateAdParams, UpdateAdParams } from '../../domain/entities/ad.entity';
import { AdvertisingAdminRepositoryImpl } from '../../data/repositories/advertising-admin.repository-impl';
import { AdvertisingAdminRemoteDatasource } from '../../data/datasources/advertising-admin.remote-datasource';

const datasource = new AdvertisingAdminRemoteDatasource();
const repository = new AdvertisingAdminRepositoryImpl(datasource);

export function useAdvertisingAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<AdFilters>({});

  const adsQuery = useQuery<AdEntity[]>({
    queryKey: ['admin-ads', filters],
    queryFn: () => repository.getAll(filters),
  });

  const createAd = useMutation<AdEntity, Error, CreateAdParams>({
    mutationFn: (params) => repository.create(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ads'] });
    },
  });

  const updateAd = useMutation<AdEntity, Error, { id: string; params: UpdateAdParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ads'] });
    },
  });

  const deleteAd = useMutation<void, Error, string>({
    mutationFn: (id) => repository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ads'] });
    },
  });

  const ads = (adsQuery.data ?? []) as AdEntity[];

  const adsByStatus = useMemo(() => {
    const grouped: Record<AdStatus, AdEntity[]> = {
      draft: [],
      active: [],
      paused: [],
      completed: [],
      rejected: [],
    };
    ads.forEach((a) => {
      grouped[a.status]?.push(a);
    });
    return grouped;
  }, [ads]);

  const totalImpressions = useMemo(() => ads.reduce((sum, a) => sum + a.impressions, 0), [ads]);
  const totalClicks = useMemo(() => ads.reduce((sum, a) => sum + a.clicks, 0), [ads]);
  const totalSpent = useMemo(() => ads.reduce((sum, a) => sum + a.spent, 0), [ads]);

  const setStatusFilter = useCallback((status?: AdStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    ads,
    adsByStatus,
    totalImpressions,
    totalClicks,
    totalSpent,
    isLoading: adsQuery.isLoading,
    isError: adsQuery.isError,
    error: adsQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setSearchFilter,
    setPage,
    createAd,
    updateAd,
    deleteAd,
  };
}
