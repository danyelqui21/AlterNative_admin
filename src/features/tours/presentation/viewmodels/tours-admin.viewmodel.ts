import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TourEntity, TourFilters, TourStatus, CreateTourParams, UpdateTourParams } from '../../domain/entities/tour.entity';
import { ToursAdminRepositoryImpl } from '../../data/repositories/tours-admin.repository-impl';
import { ToursAdminRemoteDatasource } from '../../data/datasources/tours-admin.remote-datasource';

const datasource = new ToursAdminRemoteDatasource();
const repository = new ToursAdminRepositoryImpl(datasource);

export function useToursAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<TourFilters>({});

  const toursQuery = useQuery<TourEntity[]>({
    queryKey: ['admin-tours', filters],
    queryFn: () => repository.getAll(filters),
  });

  const createTour = useMutation<TourEntity, Error, CreateTourParams>({
    mutationFn: (params) => repository.create(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tours'] });
    },
  });

  const updateTour = useMutation<TourEntity, Error, { id: string; params: UpdateTourParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tours'] });
    },
  });

  const deleteTour = useMutation<void, Error, string>({
    mutationFn: (id) => repository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tours'] });
    },
  });

  const tours = (toursQuery.data ?? []) as TourEntity[];

  const toursByStatus = useMemo(() => {
    const grouped: Record<TourStatus, TourEntity[]> = {
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

  const setStatusFilter = useCallback((status?: TourStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

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
