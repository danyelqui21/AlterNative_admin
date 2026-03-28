export interface PlatformSettings {
  id: string;
  platformName: string;
  supportEmail: string;
  supportPhone?: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCity: string;
  availableCities: string[];
  commissionRate: number;
  minWithdrawalAmount: number;
  maxTicketsPerPurchase: number;
  termsUrl?: string;
  privacyUrl?: string;
  updatedAt: string;
}

export interface ClanCreationConfig {
  id: string;
  enableEveryNUsers: number;
  maxClansPerUser: number;
  maxMembersPerClan: number;
  organizersAutoEnabled: boolean;
  updatedAt: string;
}

export interface UpdatePlatformSettingsRequest extends Partial<Omit<PlatformSettings, 'id' | 'updatedAt'>> {}

export interface UpdateClanConfigRequest extends Partial<Omit<ClanCreationConfig, 'id' | 'updatedAt'>> {}
