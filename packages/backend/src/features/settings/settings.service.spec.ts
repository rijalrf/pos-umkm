import { SettingsService } from './settings.service';
import { prisma } from '../../config/database.config';
import {
  uploadToDrive,
} from '../../shared/services/gdrive.service';

const mockStoreSetting = {
  id: 'default',
  storeName: 'Toko Demo',
  address: 'Jl. Contoh No. 123, Jakarta',
  phone: '081234567890',
  email: 'toko@example.com',
  logoUrl: 'http://gdrive.com/logo.png',
  currency: 'IDR',
  timezone: 'Asia/Jakarta',
  dateFormat: 'DD/MM/YYYY',
  updatedAt: new Date(),
};

jest.mock('../../config/database.config', () => ({
  prisma: {
    gDriveConfig: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    storeSetting: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../shared/services/gdrive.service', () => ({
  authorizeGoogleDrive: jest.fn(),
  handleOAuthCallback: jest.fn(),
  testConnection: jest.fn(),
  uploadToDrive: jest.fn(),
}));

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SettingsService();
  });

  describe('getStoreSetting', () => {
    it('should return existing store settings if found', async () => {
      (prisma.storeSetting.findFirst as jest.Mock).mockResolvedValue(mockStoreSetting);

      const result = await service.getStoreSetting();

      expect(prisma.storeSetting.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockStoreSetting);
    });

    it('should create and return default store settings if not found', async () => {
      (prisma.storeSetting.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.storeSetting.create as jest.Mock).mockResolvedValue(mockStoreSetting);

      const result = await service.getStoreSetting();

      expect(prisma.storeSetting.findFirst).toHaveBeenCalled();
      expect(prisma.storeSetting.create).toHaveBeenCalledWith({
        data: {
          id: 'default',
          storeName: 'Toko Demo',
          address: 'Jl. Contoh No. 123, Jakarta',
          phone: '081234567890',
          email: 'toko@example.com',
        },
      });
      expect(result).toEqual(mockStoreSetting);
    });
  });

  describe('updateStoreSetting', () => {
    it('should update store settings successfully', async () => {
      (prisma.storeSetting.findFirst as jest.Mock).mockResolvedValue(mockStoreSetting);
      (prisma.storeSetting.update as jest.Mock).mockResolvedValue({
        ...mockStoreSetting,
        storeName: 'Toko Baru',
      });

      const input = {
        storeName: 'Toko Baru',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        email: 'toko@example.com',
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
      };

      const result = await service.updateStoreSetting(input);

      expect(prisma.storeSetting.update).toHaveBeenCalledWith({
        where: { id: mockStoreSetting.id },
        data: input,
      });
      expect(result.storeName).toBe('Toko Baru');
    });
  });

  describe('uploadLogo', () => {
    it('should upload image file and update store setting logoUrl', async () => {
      (prisma.storeSetting.findFirst as jest.Mock).mockResolvedValue(mockStoreSetting);
      (uploadToDrive as jest.Mock).mockResolvedValue('http://gdrive.com/new-logo.png');
      (prisma.storeSetting.update as jest.Mock).mockResolvedValue({
        ...mockStoreSetting,
        logoUrl: 'http://gdrive.com/new-logo.png',
      });

      const mockFile = {
        originalname: 'mylogo.png',
        mimetype: 'image/png',
        buffer: Buffer.from('hello'),
        size: 5,
      } as Express.Multer.File;

      const result = await service.uploadLogo(mockFile);

      expect(uploadToDrive).toHaveBeenCalledWith(
        expect.stringContaining('store-logo-'),
        'image/png',
        mockFile.buffer
      );
      expect(prisma.storeSetting.update).toHaveBeenCalledWith({
        where: { id: mockStoreSetting.id },
        data: { logoUrl: 'http://gdrive.com/new-logo.png' },
      });
      expect(result).toBe('http://gdrive.com/new-logo.png');
    });
  });
});
