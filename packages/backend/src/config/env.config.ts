import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  encryptionKey: process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f61234',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  gdriveClientId: process.env.GDRIVE_CLIENT_ID || '',
  gdriveClientSecret: process.env.GDRIVE_CLIENT_SECRET || '',
  gdriveRedirectUri: process.env.GDRIVE_REDIRECT_URI || '',
  uploadToGDrive: process.env.UPLOAD_TO_GDRIVE === 'true',
  emailFrom: process.env.EMAIL_FROM || 'noreply@pos-umkm.com',
  emailService: process.env.EMAIL_SERVICE || 'nodemailer',
  emailSmtpHost: process.env.EMAIL_SMTP_HOST || '',
  emailSmtpPort: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
  emailSmtpUser: process.env.EMAIL_SMTP_USER || '',
  emailSmtpPass: process.env.EMAIL_SMTP_PASS || '',
};
