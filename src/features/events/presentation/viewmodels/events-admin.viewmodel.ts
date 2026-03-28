import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  EventEntity,
  EventFilters,
  EventStatus,
  CreateEventParams,
  UpdateEventParams,
} from '../../domain/entities/event.entity';
import { EventsAdminRepositoryImpl } from '../../data/repositories/events-admin.repository-impl';
import { EventsAdminRemoteDatasource } from '../../data/datasources/events-admin.remote-datasource';

const datasource = new EventsAdminRemoteDatasource();
const repository = new EventsAdminRepositoryImpl(datasource);

export function useEventsAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<EventFilters>({});

  const eventsQuery = useQuery<EventEntity[]>({
    queryKey: ['admin-events', filters],
    queryFn: () => repository.getAll(filters),
  });

  const createEvent = useMutation<EventEntity, Error, CreateEventParams>({
    mutationFn: (params) => repository.create(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });

  const updateEvent = useMutation<EventEntity, Error, { id: string; params: UpdateEventParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });

  const cancelEvent = useMutation<EventEntity, Error, string>({
    mutationFn: (id) => repository.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });

  const activateEvent = useMutation<EventEntity, Error, string>({
    mutationFn: (id) => repository.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });

  const featureEvent = useMutation<EventEntity, Error, { id: string; featured: boolean }>({
    mutationFn: ({ id, featured }) => repository.feature(id, featured),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });

  const deleteEvent = useMutation<void, Error, string>({
    mutationFn: (id) => repository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });

  const events = (eventsQuery.data ?? []) as EventEntity[];

  const eventsByStatus = useMemo(() => {
    const grouped: Record<EventStatus, EventEntity[]> = {
      draft: [],
      active: [],
      completed: [],
      cancelled: [],
    };
    events.forEach((e) => {
      grouped[e.status]?.push(e);
    });
    return grouped;
  }, [events]);

  const totalTicketsSold = useMemo(
    () => events.reduce((sum, e) => sum + e.ticketsSold, 0),
    [events],
  );

  const totalRevenue = useMemo(
    () => events.reduce((sum, e) => sum + e.price * e.ticketsSold, 0),
    [events],
  );

  const setStatusFilter = useCallback((status?: EventStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setCategoryFilter = useCallback((category?: string) =>
    setFilters((prev) => ({ ...prev, category, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    events,
    eventsByStatus,
    totalTicketsSold,
    totalRevenue,
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setCategoryFilter,
    setSearchFilter,
    setPage,
    createEvent,
    updateEvent,
    cancelEvent,
    activateEvent,
    featureEvent,
    deleteEvent,
  };
}
