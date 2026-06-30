import { SettingsRepository } from './settings.repository';
import {
  authorizeGoogleDrive,
  handleOAuthCallback,
  testConnection,
} from '../../shared/services/gdrive.service';
import { GDriveConfigStatus } from './settings.types';

export class SettingsService {
  private repository = new SettingsRepository();

  async getGDriveStatus(): Promise<GDriveConfigStatus> {
    const config = await this.repository.getGDriveConfig();
    return {
      isConnected: config ? config.isConnected : false,
    };
  }

  async getAuthorizeUrl(clientId: string, clientSecret: string): Promise<string> {
    return authorizeGoogleDrive(clientId, clientSecret);
  }

  async handleCallback(code: string): Promise<void> {
    await handleOAuthCallback(code);
  }

  async testGDriveConnection(): Promise<boolean> {
    return testConnection();
  }
}
