import { useState, useMemo } from 'react';
import {
  useTours,
  useCreateTour,
  useUpdateTour,
  useDeleteTour,
} from '../api/tours-api';
import type { Tour, TourFilters, TourStatus } from '../types/tour';

export function useToursAdmin() {
  const [filters, setFilters] = useState<TourFilters>({});

  const toursQuery = useTours(filters);
  const createTour = useCreateTour();
  const updateTour = useUpdateTour();
  const deleteTour = useDeleteTour();

  const tours = (toursQuery.data ?? []) as Tour[];

  const toursByStatus = useMemo(() => {
    const grouped: Record<TourStatus, Tour[]> = {
      draft: [],
      active: [],
      paused: [],
      archived: [],
    };
    tours.forEach((t) => {
      grouped[t.status]?.push(t);
    });
    return grouped;
  }, [tours]);

  const averageRating = useMemo(() => {
    if (tours.length === 0) return 0;
    return tours.reduce((sum, t) => sum + t.rating, 0) / tours.length;
  }, [tours]);

  const setStatusFilter = (status?: TourStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  return {
    tours,
    toursByStatus,
    averageRating,
    isLoading: toursQuery.isLoading,
    isError: toursQuery.isError,
    error: toursQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setSearchFilter,
    setPage,
    createTour,
    updateTour,
    deleteTour,
  };
}
