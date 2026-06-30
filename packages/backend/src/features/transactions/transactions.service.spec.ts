import { TransactionsService } from './transactions.service';
import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';

const mockProduct = {
  id: 'prod-1',
  sku: 'PRD001',
  name: 'Kopi Susu Gula Aren',
  categoryId: 'cat-1',
  price: new Prisma.Decimal(15000),
  stock: 20,
  stockAlertThreshold: 5,
  description: 'Kopi susu gula aren segar',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTransaction = {
  id: 'tx-1',
  transactionCode: 'TX-20260630-123456',
  customerId: 'cust-1',
  customerName: 'Asep',
  cashierId: 'cashier-1',
  totalAmount: new Prisma.Decimal(15000),
  cashReceived: new Prisma.Decimal(20000),
  cashReturn: new Prisma.Decimal(5000),
  transactionDate: new Date(),
  createdAt: new Date(),
  items: [
    {
      id: 'txi-1',
      transactionId: 'tx-1',
      productId: 'prod-1',
      quantity: 1,
      priceAtPurchase: new Prisma.Decimal(15000),
      subtotal: new Prisma.Decimal(15000),
      product: {
        name: 'Kopi Susu Gula Aren',
        sku: 'PRD001',
      },
    },
  ],
  cashier: {
    username: 'kasir',
    fullName: 'Kasir Demo',
  },
  customer: {
    email: 'asep@example.com',
    name: 'Asep',
  },
};

jest.mock('../../config/database.config', () => ({
  prisma: {
    transaction: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    storeSetting: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('TransactionsService', () => {
  let transactionsService: TransactionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    transactionsService = new TransactionsService();
  });

  describe('getTransactionById', () => {
    it('should return a transaction with details if it exists', async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await transactionsService.getTransactionById('tx-1');

      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                },
              },
            },
          },
          cashier: {
            select: {
              username: true,
              fullName: true,
            },
          },
          customer: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundError if transaction does not exist', async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(transactionsService.getTransactionById('invalid')).rejects.toThrow('Transaction not found');
    });
  });

  describe('getAllTransactions', () => {
    it('should return paginated transactions and total count', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([mockTransaction]);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(1);

      const result = await transactionsService.getAllTransactions({ page: 1, limit: 10 });

      expect(prisma.transaction.findMany).toHaveBeenCalled();
      expect(prisma.transaction.count).toHaveBeenCalled();
      expect(result).toEqual({
        transactions: [mockTransaction],
        total: 1,
      });
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      // Mock customer validation
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        name: 'Asep',
        email: 'asep@example.com',
      });

      // Mock $transaction callback execution
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txPrismaMock = {
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn(),
          },
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        };
        return callback(txPrismaMock);
      });

      const result = await transactionsService.createTransaction('cashier-1', {
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        cashReceived: 20000,
      });

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'cust-1' },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it('should throw BadRequestError if product stock is insufficient', async () => {
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        name: 'Asep',
      });

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txPrismaMock = {
          product: {
            // Product stock is 20, but we ask for 25
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn(),
          },
        };
        return callback(txPrismaMock);
      });

      await expect(
        transactionsService.createTransaction('cashier-1', {
          customerId: 'cust-1',
          items: [{ productId: 'prod-1', quantity: 25 }],
          cashReceived: 500000,
        })
      ).rejects.toThrow(/Insufficient stock/);
    });

    it('should throw BadRequestError if cash received is less than total amount', async () => {
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        name: 'Asep',
      });

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const txPrismaMock = {
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn(),
          },
        };
        return callback(txPrismaMock);
      });

      await expect(
        transactionsService.createTransaction('cashier-1', {
          customerId: 'cust-1',
          items: [{ productId: 'prod-1', quantity: 1 }],
          cashReceived: 10000, // less than 15000 price
        })
      ).rejects.toThrow(/Insufficient cash received/);
    });
  });
});
