import { ProductsRepository } from '../../features/products/products.repository';
import { generateDriveFileName } from '../utils/file-naming.util';
import { NotFoundError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import { uploadToDrive } from './gdrive.service';

const productsRepository = new ProductsRepository();

export const uploadProductImage = async (
  productId: string,
  file: Express.Multer.File
): Promise<string> => {
  const product = await productsRepository.findById(productId);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const fileName = generateDriveFileName(product.sku, file.originalname);

  logger.info('Uploading product image', {
    productId,
    fileName,
    fileSize: file.size,
  });

  const imageUrl = await uploadToDrive(fileName, file.mimetype, file.buffer);

  await productsRepository.updateImageUrl(productId, imageUrl);

  logger.info('Product image uploaded successfully', {
    productId,
    imageUrl,
  });

  return imageUrl;
};
