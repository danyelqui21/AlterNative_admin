import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminUserEntity, AdminLoginParams, AdminAuthResponse } from '../../domain/entities/admin-user.entity';
import { AuthAdminRepositoryImpl } from '../../data/repositories/auth-admin.repository-impl';
import { AuthAdminRemoteDatasource } from '../../data/datasources/auth-admin.remote-datasource';
import { apiClient } from '@/core/api/api-client';

const datasource = new AuthAdminRemoteDatasource();
const repository = new AuthAdminRepositoryImpl(datasource);

export function useAuthAdminViewModel() {
  const qc = useQueryClient();

  const meQuery = useQuery<AdminUserEntity>({
    queryKey: ['admin-me'],
    queryFn: () => repository.getMe(),
    enabled: apiClient.isAuthenticated,
  });

  const loginMutation = useMutation<AdminAuthResponse, Error, AdminLoginParams>({
    mutationFn: (params) => repository.login(params),
    onSuccess: (data) => {
      apiClient.setTokens(data.token);
      qc.invalidateQueries({ queryKey: ['admin-me'] });
    },
  });

  const isAuthenticated = !!meQuery.data;
  const user = meQuery.data ?? null;

  const login = useCallback(
    (credentials: AdminLoginParams) => loginMutation.mutateAsync(credentials),
    [loginMutation],
  );

  const logout = useCallback(() => {
    apiClient.clearTokens();
    qc.removeQueries({ queryKey: ['admin-me'] });
    qc.clear();
    window.location.href = '/login';
  }, [qc]);

  return {
    user,
    isAuthenticated,
    isLoading: meQuery.isLoading,
    login,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}
