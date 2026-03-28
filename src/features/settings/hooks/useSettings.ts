import {
  usePlatformSettings,
  useUpdatePlatformSettings,
  useClanConfig,
  useUpdateClanConfig,
} from '../api/settings-api';

export function useSettings() {
  const settingsQuery = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();
  const clanConfigQuery = useClanConfig();
  const updateClanConfig = useUpdateClanConfig();

  return {
    settings: settingsQuery.data,
    clanConfig: clanConfigQuery.data,
    isLoading: settingsQuery.isLoading || clanConfigQuery.isLoading,
    isError: settingsQuery.isError || clanConfigQuery.isError,
    error: settingsQuery.error ?? clanConfigQuery.error,
    updateSettings,
    updateClanConfig,
  };
}
