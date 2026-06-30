import { generateDriveFileName } from '../utils/file-naming.util';
import { uploadToDrive } from './gdrive.service';
import { prisma } from '../../config/database.config';
import { logger } from '../utils/logger.util';

export const uploadProductImage = async (
  productId: string,
  file: Express.Multer.File
): Promise<string> => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const fileName = generateDriveFileName(product.sku, file.originalname);

  logger.info('Uploading product image', {
    productId,
    fileName,
    fileSize: file.size,
  });

  const imageUrl = await uploadToDrive(fileName, file.mimetype, file.buffer);

  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl },
  });

  logger.info('Product image uploaded successfully', {
    productId,
    imageUrl,
  });

  return imageUrl;
};
