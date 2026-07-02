import { SettingsService, GDriveConfigPayload, StoreSettingsPayload } from './settings.service';

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

  async getStoreSetting() {
    try {
      const response = await SettingsService.getStoreSetting();
      return response.data; // StoreSetting model
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch store settings');
    }
  }

  async updateStoreSetting(payload: StoreSettingsPayload) {
    try {
      const response = await SettingsService.updateStoreSetting(payload);
      return response.data; // StoreSetting model
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update store settings');
    }
  }

  async uploadStoreLogo(file: File) {
    try {
      const response = await SettingsService.uploadStoreLogo(file);
      return response.data; // { logoUrl: string }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload store logo');
    }
  }

  async uploadStoreQris(file: File) {
    try {
      const response = await SettingsService.uploadStoreQris(file);
      return response.data; // { qrisUrl: string }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload store QRIS');
    }
  }
}
