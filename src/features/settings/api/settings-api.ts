import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  PlatformSettings,
  ClanCreationConfig,
  UpdatePlatformSettingsRequest,
  UpdateClanConfigRequest,
} from '../types/settings';

export function usePlatformSettings() {
  return useQuery<PlatformSettings>({
    queryKey: ['admin-platform-settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings');
      return data?.data ?? data;
    },
  });
}

export function useUpdatePlatformSettings() {
  const qc = useQueryClient();
  return useMutation<PlatformSettings, Error, UpdatePlatformSettingsRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.patch('/admin/settings', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-platform-settings'] });
    },
  });
}

export function useClanConfig() {
  return useQuery<ClanCreationConfig>({
    queryKey: ['admin-clan-config'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings/clan-config');
      return data?.data ?? data;
    },
  });
}

export function useUpdateClanConfig() {
  const qc = useQueryClient();
  return useMutation<ClanCreationConfig, Error, UpdateClanConfigRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.patch('/admin/settings/clan-config', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-clan-config'] });
    },
  });
}
