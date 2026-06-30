import { prisma } from '../../config/database.config';
import { Product } from '@prisma/client';
import { CreateProductInput, UpdateProductInput, GetProductsQuery } from './products.schema';
import { PaginatedProducts } from './products.types';

export class ProductsRepository {
  async findAndCount(query: GetProductsQuery): Promise<PaginatedProducts> {
    const { page = 1, limit = 10, search, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async create(data: CreateProductInput): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        price: data.price,
        stock: data.stock,
        description: data.description || null,
        stockAlertThreshold: data.stockAlertThreshold ?? 10,
      },
      include: { category: true },
    });
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        price: data.price,
        stock: data.stock,
        description: data.description,
        stockAlertThreshold: data.stockAlertThreshold,
      },
      include: { category: true },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }
}
