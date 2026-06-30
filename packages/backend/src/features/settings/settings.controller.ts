import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import { logger } from '../../shared/utils/logger.util';

export class SettingsController {
  private settingsService = new SettingsService();

  getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await this.settingsService.getGDriveStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  };

  authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId, clientSecret } = req.body;
      const authUrl = await this.settingsService.getAuthorizeUrl(clientId, clientSecret);
      res.json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      next(error);
    }
  };

  callback = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const code = req.query.code as string;
      if (!code) {
        throw new Error('OAuth code is missing');
      }

      await this.settingsService.handleCallback(code);

      logger.info('Google Drive authorized successfully via OAuth callback');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/settings?gdrive=success`);
    } catch (error: any) {
      logger.error('Failed to handle Google Drive OAuth callback', { error: error.message });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/settings?gdrive=error&message=${encodeURIComponent(error.message)}`);
    }
  };

  test = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isConnected = await this.settingsService.testGDriveConnection();
      res.json({
        success: true,
        data: { isConnected },
      });
    } catch (error) {
      next(error);
    }
  };

  getStoreSetting = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.settingsService.getStoreSetting();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStoreSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.settingsService.updateStoreSetting(req.body);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadLogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No logo file uploaded',
        });
        return;
      }
      const logoUrl = await this.settingsService.uploadLogo(file);
      res.status(200).json({
        success: true,
        data: { logoUrl },
      });
    } catch (error) {
      next(error);
    }
  };
}
