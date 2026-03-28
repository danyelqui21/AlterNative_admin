import { useState, useMemo } from 'react';
import {
  useRestaurants,
  useCreateRestaurant,
  useUpdateRestaurant,
  useDeleteRestaurant,
} from '../api/restaurants-api';
import type { Restaurant, RestaurantFilters } from '../types/restaurant';

export function useRestaurantsAdmin() {
  const [filters, setFilters] = useState<RestaurantFilters>({});

  const restaurantsQuery = useRestaurants(filters);
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const deleteRestaurant = useDeleteRestaurant();

  const restaurants = (restaurantsQuery.data ?? []) as Restaurant[];

  const bySubscriptionTier = useMemo(() => {
    const grouped: Record<string, Restaurant[]> = {};
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

  const setCuisineFilter = (cuisine?: string) =>
    setFilters((prev) => ({ ...prev, cuisine, page: 1 }));

  const setCityFilter = (city?: string) =>
    setFilters((prev) => ({ ...prev, city, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

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
