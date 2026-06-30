import { prisma } from '../../config/database.config';
import { Category } from '@prisma/client';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';

export class CategoriesRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}
