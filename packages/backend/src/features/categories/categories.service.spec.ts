import { CategoriesService } from './categories.service';
import { prisma } from '../../config/database.config';

const mockCategory = {
  id: 'cat-1',
  name: 'Makanan',
  description: 'Kategori makanan saji',
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('../../config/database.config', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    categoriesService = new CategoriesService();
  });

  describe('getAllCategories', () => {
    it('should return a list of categories', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await categoriesService.getAllCategories();

      expect(prisma.category.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category if it exists', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoriesService.getCategoryById('cat-1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category does not exist', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(categoriesService.getCategoryById('invalid')).rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null); // No conflict
      (prisma.category.create as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoriesService.createCategory({
        name: 'Makanan',
        description: 'Kategori makanan saji',
      });

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Makanan',
          description: 'Kategori makanan saji',
        },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category name already exists', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory); // Conflicting category exists

      await expect(
        categoriesService.createCategory({
          name: 'Makanan',
        })
      ).rejects.toThrow('Category name already exists');
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory); // Found target
      (prisma.category.update as jest.Mock).mockResolvedValue({
        ...mockCategory,
        description: 'New Description',
      });

      const result = await categoriesService.updateCategory('cat-1', {
        name: 'Makanan',
        description: 'New Description',
      });

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: {
          name: 'Makanan',
          description: 'New Description',
        },
      });
      expect(result.description).toBe('New Description');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory);

      await categoriesService.deleteCategory('cat-1');

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });
  });
});
