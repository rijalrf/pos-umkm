import { SettingsService } from './settings.service';
import { GDriveConfigPayload, StoreSettingsPayload } from './settings.types';
import { AxiosError } from 'axios';

export class SettingsPresenter {
  async getGDriveStatus() {
    try {
      const response = await SettingsService.getGDriveStatus();
      return response.data;
    } catch (error: unknown) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to check Google Drive status');
    }
  }

  async authorizeGDrive(payload: GDriveConfigPayload) {
    try {
      const response = await SettingsService.authorizeGDrive(payload);
      return response.data;
    } catch (error: unknown) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to initiate Google Drive authorization');
    }
  }

  async testGDriveConnection() {
    try {
      const response = await SettingsService.testGDriveConnection();
      return response.data;
    } catch (error: unknown) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Google Drive connection test failed');
    }
  }

  async getStoreSetting() {
    try {
      const response = await SettingsService.getStoreSetting();
      return response.data;
    } catch (error: unknown) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to fetch store settings');
    }
  }

  async updateStoreSetting(payload: StoreSettingsPayload) {
    try {
      const response = await SettingsService.updateStoreSetting(payload);
      return response.data;
    } catch (error: unknown) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to update store settings');
    }
  }

  async uploadStoreLogo(file: File) {
    try {
      const response = await SettingsService.uploadStoreLogo(file);
      return response.data;
    } catch (error: unknown) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to upload store logo');
    }
  }

  async uploadStoreQris(file: File) {
    try {
      const response = await SettingsService.uploadStoreQris(file);
      return response.data;
    } catch (error: unknown) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to upload store QRIS');
    }
  }
}
