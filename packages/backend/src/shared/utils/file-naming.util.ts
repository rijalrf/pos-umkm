import { randomUUID } from 'crypto';
import path from 'path';

export const generateDriveFileName = (
  sku: string,
  originalName: string
): string => {
  const timestamp = Date.now();
  const unique = randomUUID().slice(0, 8);
  const ext = path.extname(originalName);
  
  return `${timestamp}-${sku}-${unique}${ext}`;
};
