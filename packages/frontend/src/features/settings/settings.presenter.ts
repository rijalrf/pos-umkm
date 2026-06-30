import { SettingsService, GDriveConfigPayload } from './settings.service';

export class SettingsPresenter {
  async getGDriveStatus() {
    try {
      const response = await SettingsService.getGDriveStatus();
      return response.data; // { isConnected: boolean }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check Google Drive status');
    }
  }

  async authorizeGDrive(payload: GDriveConfigPayload) {
    try {
      const response = await SettingsService.authorizeGDrive(payload);
      return response.data; // { authUrl: string }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate Google Drive authorization');
    }
  }

  async testGDriveConnection() {
    try {
      const response = await SettingsService.testGDriveConnection();
      return response.data; // { isConnected: boolean }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google Drive connection test failed');
    }
  }
}
