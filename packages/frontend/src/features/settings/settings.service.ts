import { api } from '../../libs/api.lib';

export interface GDriveConfigPayload {
  clientId: string;
  clientSecret: string;
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
}
