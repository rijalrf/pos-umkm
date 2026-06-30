import { prisma } from '../../config/database.config';
import { GDriveConfig, StoreSetting } from '@prisma/client';

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

  async getStoreSetting(): Promise<StoreSetting> {
    const setting = await prisma.storeSetting.findFirst();
    if (setting) {
      return setting;
    }
    // Create default setting if none exists
    return prisma.storeSetting.create({
      data: {
        id: 'default',
        storeName: 'Toko Demo',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        email: 'toko@example.com',
      },
    });
  }

  async updateStoreSetting(data: Partial<Omit<StoreSetting, 'id' | 'updatedAt'>>): Promise<StoreSetting> {
    const current = await this.getStoreSetting();
    return prisma.storeSetting.update({
      where: { id: current.id },
      data,
    });
  }
}
