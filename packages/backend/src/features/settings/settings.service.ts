import path from 'path';
import { SettingsRepository } from './settings.repository';
import {
  authorizeGoogleDrive,
  handleOAuthCallback,
  testConnection,
  uploadToDrive,
} from '../../shared/services/gdrive.service';
import { env } from '../../config/env.config';
import { GDriveConfigStatus } from './settings.types';
import { StoreSetting } from '@prisma/client';
import { UpdateStoreSettingsInput } from './settings.schema';
import { logger } from '../../shared/utils/logger.util';

export class SettingsService {
  private repository = new SettingsRepository();

  async getGDriveStatus(): Promise<GDriveConfigStatus> {
    const config = await this.repository.getGDriveConfig();
    const hasEnvConfig = !!env.gdriveClientId && !!env.gdriveClientSecret;
    const isConnectedEnv = hasEnvConfig && !!env.gdriveRefreshToken;
    const isConnectedDb = config ? config.isConnected : false;

    return {
      isConnected: isConnectedEnv || isConnectedDb,
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

  async getStoreSetting(): Promise<StoreSetting> {
    return this.repository.getStoreSetting();
  }

  async updateStoreSetting(data: UpdateStoreSettingsInput): Promise<StoreSetting> {
    return this.repository.updateStoreSetting(data);
  }

  async uploadLogo(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const fileName = `store-logo-${Date.now()}${ext}`;

    logger.info('Uploading store logo to Google Drive', {
      fileName,
      fileSize: file.size,
    });

    const logoUrl = await uploadToDrive(fileName, file.mimetype, file.buffer);

    await this.repository.updateStoreSetting({ logoUrl });

    logger.info('Store logo uploaded successfully', { logoUrl });

    return logoUrl;
  }

  async uploadQris(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const fileName = `store-qris-${Date.now()}${ext}`;

    logger.info('Uploading store QRIS to Google Drive', {
      fileName,
      fileSize: file.size,
    });

    const qrisUrl = await uploadToDrive(fileName, file.mimetype, file.buffer);

    await this.repository.updateStoreSetting({ qrisUrl });

    logger.info('Store QRIS uploaded successfully', { qrisUrl });

    return qrisUrl;
  }
}
