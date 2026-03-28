import { useState, useMemo } from 'react';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '../api/events-api';
import type { Event, EventFilters, EventStatus } from '../types/event';

export function useEventsAdmin() {
  const [filters, setFilters] = useState<EventFilters>({});

  const eventsQuery = useEvents(filters);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const events = (eventsQuery.data ?? []) as Event[];

  const eventsByStatus = useMemo(() => {
    const grouped: Record<EventStatus, Event[]> = {
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

  const setStatusFilter = (status?: EventStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setCategoryFilter = (category?: string) =>
    setFilters((prev) => ({ ...prev, category, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

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
    deleteEvent,
  };
}
