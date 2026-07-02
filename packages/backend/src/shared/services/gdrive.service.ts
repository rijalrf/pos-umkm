import { google } from 'googleapis';
import { Readable } from 'stream';
import { prisma } from '../../config/database.config';
import { logger } from '../utils/logger.util';
import { decrypt, encrypt } from '../utils/encryption.util';
import { env } from '../../config/env.config';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const saveFileLocally = async (fileName: string, buffer: Buffer): Promise<string> => {
  const uploadsDir = path.join(__dirname, '../../../uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, fileName);
  await fs.promises.writeFile(filePath, buffer);

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const fileUrl = `${backendUrl}/uploads/${fileName}`;

  logger.info('File saved locally to server', {
    fileName,
    filePath,
    fileUrl,
  });

  return fileUrl;
};

export const getOAuth2Client = async () => {
  const config = await prisma.gDriveConfig.findFirst();

  const clientId = process.env.GDRIVE_CLIENT_ID || (config?.clientId ? decrypt(config.clientId) : '');
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET || (config?.clientSecret ? decrypt(config.clientSecret) : '');
  const redirectUri = process.env.GDRIVE_REDIRECT_URI || '';

  if (!clientId || !clientSecret) {
    throw new Error('Google Drive credentials (GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET) not configured');
  }

  const refreshToken = process.env.GDRIVE_REFRESH_TOKEN || (config?.refreshToken ? decrypt(config.refreshToken) : '');
  const accessToken = config?.accessToken ? decrypt(config.accessToken) : undefined;

  const isConnectedEnv = !!process.env.GDRIVE_CLIENT_ID && !!process.env.GDRIVE_CLIENT_SECRET && !!process.env.GDRIVE_REFRESH_TOKEN;
  const isConnectedDb = config ? config.isConnected : false;

  if (!isConnectedEnv && !isConnectedDb) {
    throw new Error('Google Drive not configured or connected');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: accessToken,
  });

  return oauth2Client;
};

export const uploadToDrive = async (
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> => {
  // Always save to local server first
  const localUrl = await saveFileLocally(fileName, buffer);

  // Check if Google Drive upload is enabled in config
  const shouldUploadToDrive = env.uploadToGDrive;
  if (!shouldUploadToDrive) {
    logger.info('Google Drive upload is disabled. Returning local server file URL.', { fileName, localUrl });
    return localUrl;
  }

  // Check if Google Drive is configured
  let isGDriveConfigured = false;
  try {
    const config = await prisma.gDriveConfig.findFirst();
    const hasEnvConfig = !!process.env.GDRIVE_CLIENT_ID && !!process.env.GDRIVE_CLIENT_SECRET;
    const isConnectedEnv = hasEnvConfig && !!process.env.GDRIVE_REFRESH_TOKEN;
    const isConnectedDb = config ? config.isConnected : false;
    isGDriveConfigured = isConnectedEnv || isConnectedDb;
  } catch (err) {
    isGDriveConfigured = false;
  }

  if (!isGDriveConfigured) {
    logger.warn('Google Drive is enabled but not configured. Falling back to local file URL.', { fileName, localUrl });
    return localUrl;
  }

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

    logger.info('File uploaded to Google Drive successfully', {
      fileName,
      id: response.data.id,
      fileUrl,
    });

    return fileUrl;
  } catch (error) {
    logger.error('Failed to upload to Google Drive. Falling back to local file URL.', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName,
      localUrl,
    });
    return localUrl;
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

  const clientId = process.env.GDRIVE_CLIENT_ID || (config?.clientId ? decrypt(config.clientId) : '');
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET || (config?.clientSecret ? decrypt(config.clientSecret) : '');

  if (!clientId || !clientSecret) {
    throw new Error('Google Drive credentials (GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET) not configured');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GDRIVE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token || !tokens.access_token) {
    throw new Error('Failed to get tokens from Google');
  }

  await prisma.gDriveConfig.upsert({
    where: { id: config?.id || 'default' },
    update: {
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
      refreshToken: encrypt(tokens.refresh_token),
      accessToken: encrypt(tokens.access_token),
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      isConnected: true,
    },
    create: {
      id: 'default',
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
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
