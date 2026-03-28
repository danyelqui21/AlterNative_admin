import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  RestaurantEntity,
  RestaurantFilters,
  CreateRestaurantParams,
  UpdateRestaurantParams,
} from '../../domain/entities/restaurant.entity';
import { RestaurantsAdminRepositoryImpl } from '../../data/repositories/restaurants-admin.repository-impl';
import { RestaurantsAdminRemoteDatasource } from '../../data/datasources/restaurants-admin.remote-datasource';

const datasource = new RestaurantsAdminRemoteDatasource();
const repository = new RestaurantsAdminRepositoryImpl(datasource);

export function useRestaurantsAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<RestaurantFilters>({});

  const restaurantsQuery = useQuery<RestaurantEntity[]>({
    queryKey: ['admin-restaurants', filters],
    queryFn: () => repository.getAll(filters),
  });

  const createRestaurant = useMutation<RestaurantEntity, Error, CreateRestaurantParams>({
    mutationFn: (params) => repository.create(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });

  const updateRestaurant = useMutation<RestaurantEntity, Error, { id: string; params: UpdateRestaurantParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });

  const deleteRestaurant = useMutation<void, Error, string>({
    mutationFn: (id) => repository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });

  const restaurants = (restaurantsQuery.data ?? []) as RestaurantEntity[];

  const bySubscriptionTier = useMemo(() => {
    const grouped: Record<string, RestaurantEntity[]> = {};
    restaurants.forEach((r) => {
      const tier = r.subscriptionTier || 'free';
      if (!grouped[tier]) grouped[tier] = [];
      grouped[tier].push(r);
    });
    return grouped;
  }, [restaurants]);

  const averageRating = useMemo(() => {
    if (restaurants.length === 0) return 0;
    return restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length;
  }, [restaurants]);

  const setCuisineFilter = useCallback((cuisine?: string) =>
    setFilters((prev) => ({ ...prev, cuisine, page: 1 })), []);

  const setCityFilter = useCallback((city?: string) =>
    setFilters((prev) => ({ ...prev, city, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    restaurants,
    bySubscriptionTier,
    averageRating,
    isLoading: restaurantsQuery.isLoading,
    isError: restaurantsQuery.isError,
    error: restaurantsQuery.error,
    filters,
    setFilters,
    setCuisineFilter,
    setCityFilter,
    setSearchFilter,
    setPage,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
  };
}
