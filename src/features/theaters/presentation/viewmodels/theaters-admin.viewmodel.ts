import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TheaterEntity,
  SeatingLayoutEntity,
  SeatEntity,
  TheaterFilters,
  CreateTheaterParams,
  UpdateTheaterParams,
  CreateLayoutParams,
} from '../../domain/entities/theater.entity';
import { TheatersAdminRepositoryImpl } from '../../data/repositories/theaters-admin.repository-impl';
import { TheatersAdminRemoteDatasource } from '../../data/datasources/theaters-admin.remote-datasource';

const datasource = new TheatersAdminRemoteDatasource();
const repository = new TheatersAdminRepositoryImpl(datasource);

export function useTheatersAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<TheaterFilters>({});

  const theatersQuery = useQuery<TheaterEntity[]>({
    queryKey: ['admin-theaters', filters],
    queryFn: () => repository.getAll(filters),
  });

  const createTheater = useMutation<TheaterEntity, Error, CreateTheaterParams>({
    mutationFn: (params) => repository.create(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-theaters'] });
    },
  });

  const updateTheater = useMutation<TheaterEntity, Error, { id: string; params: UpdateTheaterParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-theaters'] });
    },
  });

  const enableTheater = useMutation<TheaterEntity, Error, string>({
    mutationFn: (id) => repository.enable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-theaters'] });
    },
  });

  const disableTheater = useMutation<TheaterEntity, Error, string>({
    mutationFn: (id) => repository.disable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-theaters'] });
    },
  });

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setCityFilter = useCallback((city?: string) =>
    setFilters((prev) => ({ ...prev, city, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    theaters: (theatersQuery.data ?? []) as TheaterEntity[],
    isLoading: theatersQuery.isLoading,
    isError: theatersQuery.isError,
    error: theatersQuery.error,
    filters,
    setSearchFilter,
    setCityFilter,
    setPage,
    createTheater,
    updateTheater,
    enableTheater,
    disableTheater,
  };
}

export function useLayoutViewModel(theaterId: string, layoutId: string) {
  const qc = useQueryClient();

  const layoutQuery = useQuery<SeatingLayoutEntity>({
    queryKey: ['admin-theater-layout', theaterId, layoutId],
    queryFn: () => repository.getLayout(theaterId, layoutId),
    enabled: !!theaterId && !!layoutId,
  });

  const createLayout = useMutation<SeatingLayoutEntity, Error, { theaterId: string; params: CreateLayoutParams }>({
    mutationFn: ({ theaterId, params }) => repository.createLayout(theaterId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-theaters'] });
    },
  });

  const updateLayout = useMutation<SeatingLayoutEntity, Error, { theaterId: string; layoutId: string; params: Partial<CreateLayoutParams> }>({
    mutationFn: ({ theaterId, layoutId, params }) => repository.updateLayout(theaterId, layoutId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-theater-layout'] });
    },
  });

  const saveSeats = useMutation<SeatEntity[], Error, { theaterId: string; layoutId: string; seats: SeatEntity[] }>({
    mutationFn: ({ theaterId, layoutId, seats }) => repository.bulkUpsertSeats(theaterId, layoutId, seats),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-theater-layout'] });
    },
  });

  return {
    layout: layoutQuery.data,
    isLoading: layoutQuery.isLoading,
    createLayout,
    updateLayout,
    saveSeats,
  };
}
