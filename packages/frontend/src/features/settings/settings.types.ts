export interface GDriveConfigPayload {
  clientId?: string;
  clientSecret?: string;
}

export interface StoreSettingsPayload {
  storeName: string;
  address: string;
  phone: string;
  email: string | null;
  currency: string;
  timezone: string;
  dateFormat: string;
}

export interface StoreSettingData extends StoreSettingsPayload {
  id: string;
  logoUrl: string | null;
  qrisUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
