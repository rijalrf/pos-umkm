import { api } from '../../libs/api.lib';

export interface GDriveConfigPayload {
  clientId: string;
  clientSecret: string;
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

export class SettingsService {
  static async getGDriveStatus() {
    const response = await api.get('/settings/gdrive/status');
    return response.data;
  }

  static async authorizeGDrive(payload: GDriveConfigPayload) {
    const response = await api.post('/settings/gdrive/authorize', payload);
    return response.data;
  }

  static async testGDriveConnection() {
    const response = await api.post('/settings/gdrive/test');
    return response.data;
  }

  static async getStoreSetting() {
    const response = await api.get('/settings/store');
    return response.data;
  }

  static async updateStoreSetting(payload: StoreSettingsPayload) {
    const response = await api.put('/settings/store', payload);
    return response.data;
  }

  static async uploadStoreLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/settings/store/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}
