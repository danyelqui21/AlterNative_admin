import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserEntity, UserFilters, UserRole, UpdateUserParams } from '../../domain/entities/user.entity';
import { UsersAdminRepositoryImpl } from '../../data/repositories/users-admin.repository-impl';
import { UsersAdminRemoteDatasource } from '../../data/datasources/users-admin.remote-datasource';

const datasource = new UsersAdminRemoteDatasource();
const repository = new UsersAdminRepositoryImpl(datasource);

export function useUsersAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({});

  const usersQuery = useQuery<UserEntity[]>({
    queryKey: ['admin-users', filters],
    queryFn: () => repository.getAll(filters),
  });

  const updateUser = useMutation<UserEntity, Error, { id: string; params: UpdateUserParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deactivateUser = useMutation<void, Error, string>({
    mutationFn: (id) => repository.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const users = (usersQuery.data ?? []) as UserEntity[];

  const usersByRole = useMemo(() => {
    const grouped: Record<UserRole, UserEntity[]> = {
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

  const activeCount = useMemo(() => users.filter((u) => u.isActive).length, [users]);
  const verifiedCount = useMemo(() => users.filter((u) => u.isVerified).length, [users]);

  const setRoleFilter = useCallback((role?: UserRole) =>
    setFilters((prev) => ({ ...prev, role, page: 1 })), []);

  const setActiveFilter = useCallback((isActive?: boolean) =>
    setFilters((prev) => ({ ...prev, isActive, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

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
