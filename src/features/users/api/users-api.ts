import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { User, UserFilters, UpdateUserRequest } from '../types/user';

export function useUsers(filters?: UserFilters) {
  return useQuery<User[]>({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation<User, Error, { id: string; updates: UpdateUserRequest }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/users/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user', id] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.put(`/admin/users/${id}`, { isActive: false });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
