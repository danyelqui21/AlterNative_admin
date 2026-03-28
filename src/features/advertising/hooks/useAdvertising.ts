import { useState, useMemo } from 'react';
import {
  useAds,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
} from '../api/advertising-api';
import type { Ad, AdFilters, AdStatus } from '../types/ad';

export function useAdvertising() {
  const [filters, setFilters] = useState<AdFilters>({});

  const adsQuery = useAds(filters);
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();

  const ads = (adsQuery.data ?? []) as Ad[];

  const adsByStatus = useMemo(() => {
    const grouped: Record<AdStatus, Ad[]> = {
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

  const totalImpressions = useMemo(
    () => ads.reduce((sum, a) => sum + a.impressions, 0),
    [ads],
  );

  const totalClicks = useMemo(
    () => ads.reduce((sum, a) => sum + a.clicks, 0),
    [ads],
  );

  const totalSpent = useMemo(
    () => ads.reduce((sum, a) => sum + a.spent, 0),
    [ads],
  );

  const setStatusFilter = (status?: AdStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

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
