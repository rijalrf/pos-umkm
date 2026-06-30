import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import { logger } from '../../shared/utils/logger.util';

export class SettingsController {
  private settingsService = new SettingsService();

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  test = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}
