import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { google } from 'googleapis';
import { env } from '../../config/env.config';
import { SettingsRepository } from '../../features/settings/settings.repository';
import { decrypt, encrypt } from '../utils/encryption.util';
import { logger } from '../utils/logger.util';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const settingsRepository = new SettingsRepository();

const saveFileLocally = async (fileName: string, buffer: Buffer): Promise<string> => {
  const uploadsDir = path.join(__dirname, '../../../uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, fileName);
  await fs.promises.writeFile(filePath, buffer);

  const backendUrl = env.backendUrl || `http://localhost:${env.port || 3000}`;
  const fileUrl = `${backendUrl}/uploads/${fileName}`;

  logger.info('File saved locally to server', {
    fileName,
    filePath,
    fileUrl,
  });

  return fileUrl;
};

export const getOAuth2Client = async () => {
  const config = await settingsRepository.getGDriveConfig();

  const clientId = env.gdriveClientId || (config?.clientId ? decrypt(config.clientId) : '');
  const clientSecret = env.gdriveClientSecret || (config?.clientSecret ? decrypt(config.clientSecret) : '');
  const redirectUri = env.gdriveRedirectUri || '';

  if (!clientId || !clientSecret) {
    throw new Error('Google Drive credentials (GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET) not configured');
  }

  const refreshToken = env.gdriveRefreshToken || (config?.refreshToken ? decrypt(config.refreshToken) : '');
  const accessToken = config?.accessToken ? decrypt(config.accessToken) : undefined;

  const isConnectedEnv = !!env.gdriveClientId && !!env.gdriveClientSecret && !!env.gdriveRefreshToken;
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
    const config = await settingsRepository.getGDriveConfig();
    const hasEnvConfig = !!env.gdriveClientId && !!env.gdriveClientSecret;
    const isConnectedEnv = hasEnvConfig && !!env.gdriveRefreshToken;
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
    env.gdriveRedirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  // Save encrypted credentials
  await settingsRepository.saveGDriveConfig({
    id: 'default',
    clientId: encrypt(clientId),
    clientSecret: encrypt(clientSecret),
    refreshToken: '',
    accessToken: '',
    tokenExpiry: null,
    isConnected: false,
  });

  return authUrl;
};

export const handleOAuthCallback = async (code: string): Promise<void> => {
  const config = await settingsRepository.getGDriveConfig();

  const clientId = env.gdriveClientId || (config?.clientId ? decrypt(config.clientId) : '');
  const clientSecret = env.gdriveClientSecret || (config?.clientSecret ? decrypt(config.clientSecret) : '');

  if (!clientId || !clientSecret) {
    throw new Error('Google Drive credentials (GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET) not configured');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    env.gdriveRedirectUri
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token || !tokens.access_token) {
    throw new Error('Failed to get tokens from Google');
  }

  await settingsRepository.saveGDriveConfig({
    id: config?.id || 'default',
    clientId: encrypt(clientId),
    clientSecret: encrypt(clientSecret),
    refreshToken: encrypt(tokens.refresh_token),
    accessToken: encrypt(tokens.access_token),
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    isConnected: true,
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
