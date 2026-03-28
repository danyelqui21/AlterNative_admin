import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminMe, useAdminLogin } from '../api/auth-api';
import type { AdminLoginRequest } from '../types/admin-user';

export function useAdminAuth() {
  const qc = useQueryClient();
  const meQuery = useAdminMe();
  const loginMutation = useAdminLogin();

  const isAuthenticated = !!meQuery.data;
  const user = meQuery.data ?? null;

  const login = useCallback(
    (credentials: AdminLoginRequest) => loginMutation.mutateAsync(credentials),
    [loginMutation],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('lagunapp-admin-token');
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
