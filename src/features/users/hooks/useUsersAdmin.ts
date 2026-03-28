import { useState, useMemo } from 'react';
import {
  useUsers,
  useUpdateUser,
  useDeactivateUser,
} from '../api/users-api';
import type { User, UserFilters, UserRole } from '../types/user';

export function useUsersAdmin() {
  const [filters, setFilters] = useState<UserFilters>({});

  const usersQuery = useUsers(filters);
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  const users = (usersQuery.data ?? []) as User[];

  const usersByRole = useMemo(() => {
    const grouped: Record<UserRole, User[]> = {
      user: [],
      restaurant: [],
      organizer: [],
      scanner_staff: [],
      admin: [],
    };
    users.forEach((u) => {
      grouped[u.role]?.push(u);
    });
    return grouped;
  }, [users]);

  const activeCount = useMemo(
    () => users.filter((u) => u.isActive).length,
    [users],
  );

  const verifiedCount = useMemo(
    () => users.filter((u) => u.isVerified).length,
    [users],
  );

  const setRoleFilter = (role?: UserRole) =>
    setFilters((prev) => ({ ...prev, role, page: 1 }));

  const setActiveFilter = (isActive?: boolean) =>
    setFilters((prev) => ({ ...prev, isActive, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  return {
    users,
    usersByRole,
    activeCount,
    verifiedCount,
    totalCount: users.length,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    filters,
    setFilters,
    setRoleFilter,
    setActiveFilter,
    setSearchFilter,
    setPage,
    updateUser,
    deactivateUser,
  };
}
