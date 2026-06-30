import { ProductsRepository } from './products.repository';
import { CreateProductInput, UpdateProductInput, GetProductsQuery } from './products.schema';
import { Product } from '@prisma/client';
import { PaginatedProducts } from './products.types';
import { prisma } from '../../config/database.config';

export class ProductsService {
  private repository = new ProductsRepository();

  async getProducts(query: GetProductsQuery): Promise<PaginatedProducts> {
    return this.repository.findAndCount(query);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      const err = new Error('Product not found');
      (err as any).statusCode = 404;
      throw err;
    }
    return product;
  }

  async createProduct(data: CreateProductInput): Promise<Product> {
    // Verify SKU uniqueness
    const existingSku = await this.repository.findBySku(data.sku);
    if (existingSku) {
      const err = new Error('Product SKU already exists');
      (err as any).statusCode = 400;
      throw err;
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      const err = new Error('Invalid Category ID');
      (err as any).statusCode = 400;
      throw err;
    }

    return this.repository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    await this.getProductById(id); // Throws 404 if not found

    if (data.sku) {
      const existingSku = await this.repository.findBySku(data.sku);
      if (existingSku && existingSku.id !== id) {
        const err = new Error('Product SKU already exists');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        const err = new Error('Invalid Category ID');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    return this.repository.update(id, data);
  }

  async deleteProduct(id: string): Promise<Product> {
    await this.getProductById(id); // Throws 404 if not found
    return this.repository.delete(id);
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<string> {
    await this.getProductById(id); // Throws 404 if not found
    const { uploadProductImage } = await import('../../shared/services/upload.service');
    return uploadProductImage(id, file);
  }
}
