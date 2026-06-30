import { CategoriesRepository } from './categories.repository';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';
import { Category } from '@prisma/client';

export class CategoriesService {
  private repository = new CategoriesRepository();

  async getAllCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.repository.findById(id);
    if (!category) {
      const err = new Error('Category not found');
      (err as any).statusCode = 404;
      throw err;
    }
    return category;
  }

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      const err = new Error('Category name already exists');
      (err as any).statusCode = 400;
      throw err;
    }
    return this.repository.create(data);
  }

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
    await this.getCategoryById(id); // Throws 404 if not found

    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      if (existing && existing.id !== id) {
        const err = new Error('Category name already exists');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    return this.repository.update(id, data);
  }

  async deleteCategory(id: string): Promise<Category> {
    await this.getCategoryById(id); // Throws 404 if not found
    return this.repository.delete(id);
  }
}
