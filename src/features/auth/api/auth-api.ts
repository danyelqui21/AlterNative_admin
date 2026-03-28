import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  AdminUser,
  AdminLoginRequest,
  AdminAuthResponse,
} from '../types/admin-user';

export function useAdminMe() {
  return useQuery<AdminUser>({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data?.data ?? data;
    },
    enabled: !!localStorage.getItem('lagunapp-admin-token'),
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation<AdminAuthResponse, Error, AdminLoginRequest>({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('lagunapp-admin-token', data.token);
      qc.invalidateQueries({ queryKey: ['admin-me'] });
    },
  });
}
