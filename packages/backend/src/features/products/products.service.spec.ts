import { ProductsService } from './products.service';
import { prisma } from '../../config/database.config';

const mockProduct = {
  id: 'prod-1',
  sku: 'PRD001',
  name: 'Kopi Susu Gula Aren',
  categoryId: 'cat-1',
  price: 15000,
  stock: 20,
  stockAlertThreshold: 5,
  description: 'Kopi susu gula aren segar',
  createdAt: new Date(),
  updatedAt: new Date(),
  category: {
    id: 'cat-1',
    name: 'Minuman',
  },
};

jest.mock('../../config/database.config', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  },
}));

describe('ProductsService', () => {
  let productsService: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    productsService = new ProductsService();
  });

  describe('getProducts', () => {
    it('should return a paginated list of products', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      const result = await productsService.getProducts({ page: 1, limit: 10 });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10,
      });
      expect(prisma.product.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        products: [mockProduct],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply filters and search query when provided', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      await productsService.getProducts({
        page: 1,
        limit: 10,
        categoryId: 'cat-1',
        search: 'Kopi',
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat-1',
          OR: [
            { name: { contains: 'Kopi', mode: 'insensitive' } },
            { sku: { contains: 'Kopi', mode: 'insensitive' } },
          ],
        },
        include: { category: true },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getProductById', () => {
    it('should return a product if it exists', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productsService.getProductById('prod-1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: { category: true },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product does not exist', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(productsService.getProductById('invalid')).rejects.toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 'cat-1' });
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null); // No SKU conflict
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productsService.createProduct({
        sku: 'PRD001',
        name: 'Kopi Susu Gula Aren',
        categoryId: 'cat-1',
        price: 15000,
        stock: 20,
        stockAlertThreshold: 5,
        description: 'Kopi susu gula aren segar',
      });

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          sku: 'PRD001',
          name: 'Kopi Susu Gula Aren',
          categoryId: 'cat-1',
          price: 15000,
          stock: 20,
          stockAlertThreshold: 5,
          description: 'Kopi susu gula aren segar',
        },
        include: { category: true },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if SKU already exists', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 'cat-1' });
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct); // Conflicting SKU exists

      await expect(
        productsService.createProduct({
          sku: 'PRD001',
          name: 'Kopi Susu Gula Aren',
          categoryId: 'cat-1',
          price: 15000,
          stock: 10,
        })
      ).rejects.toThrow('Product SKU already exists');
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({
        ...mockProduct,
        price: 16000,
      });

      const result = await productsService.updateProduct('prod-1', {
        price: 16000,
      });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { price: 16000 },
        include: { category: true },
      });
      expect(result.price).toBe(16000);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);

      await productsService.deleteProduct('prod-1');

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
    });
  });
});
