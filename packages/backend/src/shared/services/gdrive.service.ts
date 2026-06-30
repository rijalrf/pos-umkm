import { google } from 'googleapis';
import { Readable } from 'stream';
import { prisma } from '../../config/database.config';
import { logger } from '../utils/logger.util';
import { decrypt, encrypt } from '../utils/encryption.util';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const getOAuth2Client = async () => {
  const config = await prisma.gDriveConfig.findFirst();

  if (!config || !config.isConnected) {
    throw new Error('Google Drive not configured');
  }

  const oauth2Client = new google.auth.OAuth2(
    decrypt(config.clientId),
    decrypt(config.clientSecret),
    process.env.GDRIVE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: decrypt(config.refreshToken),
    access_token: decrypt(config.accessToken),
  });

  return oauth2Client;
};

export const uploadToDrive = async (
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> => {
  try {
    const auth = await getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: fileName,
      parents: ['root'],
    };

    const media = {
      mimeType,
      body: Readable.from(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    });

    if (!response.data.id) {
      throw new Error('Failed to get file ID from Google Drive');
    }

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get direct link
    const fileUrl = `https://drive.google.com/uc?id=${response.data.id}`;

    logger.info('File uploaded to Google Drive', {
      fileName,
      fileId: response.data.id,
    });

    return fileUrl;
  } catch (error) {
    logger.error('Failed to upload to Google Drive', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName,
    });
    throw new Error('Failed to upload to Google Drive');
  }
};

export const authorizeGoogleDrive = async (
  clientId: string,
  clientSecret: string
): Promise<string> => {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GDRIVE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  // Save encrypted credentials
  await prisma.gDriveConfig.upsert({
    where: { id: 'default' },
    update: {
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
      isConnected: false,
    },
    create: {
      id: 'default',
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
      refreshToken: '',
      accessToken: '',
      isConnected: false,
    },
  });

  return authUrl;
};

export const handleOAuthCallback = async (code: string): Promise<void> => {
  const config = await prisma.gDriveConfig.findFirst();

  if (!config) {
    throw new Error('Google Drive not configured');
  }

  const oauth2Client = new google.auth.OAuth2(
    decrypt(config.clientId),
    decrypt(config.clientSecret),
    process.env.GDRIVE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token || !tokens.access_token) {
    throw new Error('Failed to get tokens from Google');
  }

  await prisma.gDriveConfig.update({
    where: { id: config.id },
    data: {
      refreshToken: encrypt(tokens.refresh_token),
      accessToken: encrypt(tokens.access_token),
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      isConnected: true,
    },
  });

  logger.info('Google Drive connected successfully');
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const auth = await getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.list({ pageSize: 1 });

    logger.info('Google Drive connection test successful');
    return true;
  } catch (error) {
    logger.error('Google Drive connection test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};
