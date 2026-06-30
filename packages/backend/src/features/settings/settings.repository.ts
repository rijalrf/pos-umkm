import { prisma } from '../../config/database.config';
import { GDriveConfig } from '@prisma/client';

export class SettingsRepository {
  async getGDriveConfig(): Promise<GDriveConfig | null> {
    return prisma.gDriveConfig.findFirst();
  }

  async saveGDriveConfig(data: Omit<GDriveConfig, 'updatedAt'>): Promise<GDriveConfig> {
    return prisma.gDriveConfig.upsert({
      where: { id: data.id },
      update: {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        refreshToken: data.refreshToken,
        accessToken: data.accessToken,
        tokenExpiry: data.tokenExpiry,
        isConnected: data.isConnected,
      },
      create: data,
    });
  }
}
