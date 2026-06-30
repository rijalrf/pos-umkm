import { ReportsService } from './reports.service';
import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';

const mockTransactions = [
  {
    id: 'tx-1',
    transactionCode: 'TX-20260630-111111',
    customerId: 'cust-1',
    customerName: 'Budi',
    cashierId: 'user-1',
    totalAmount: new Prisma.Decimal(100000),
    cashReceived: new Prisma.Decimal(100000),
    cashReturn: new Prisma.Decimal(0),
    transactionDate: new Date('2026-06-30T10:00:00Z'),
    createdAt: new Date('2026-06-30T10:00:00Z'),
    items: [
      {
        productId: 'prod-1',
        quantity: 2,
        priceAtPurchase: new Prisma.Decimal(50000),
        subtotal: new Prisma.Decimal(100000),
        product: {
          name: 'Handmade Mug',
          sku: 'MUG-01',
          category: { name: 'Keramik' },
        },
      },
    ],
    cashier: {
      id: 'user-1',
      username: 'kasir1',
      fullName: 'Kasir Satu',
    },
    customer: {
      id: 'cust-1',
      name: 'Budi',
      email: 'budi@example.com',
    },
  },
];

jest.mock('../../config/database.config', () => ({
  prisma: {
    transaction: {
      findMany: jest.fn(),
    },
  },
}));

describe('ReportsService', () => {
  let reportsService: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    reportsService = new ReportsService();
  });

  describe('getReportData', () => {
    it('should aggregate metrics and sales over time correctly', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await reportsService.getReportData('2026-06-01', '2026-06-30');

      expect(prisma.transaction.findMany).toHaveBeenCalled();
      
      // Test metrics
      expect(result.metrics.totalSales).toBe(100000);
      expect(result.metrics.transactionCount).toBe(1);
      expect(result.metrics.averageTransactionValue).toBe(100000);
      expect(result.metrics.uniqueCustomersCount).toBe(1);

      // Test top products
      expect(result.topProducts.length).toBe(1);
      expect(result.topProducts[0].name).toBe('Handmade Mug');
      expect(result.topProducts[0].quantitySold).toBe(2);
      expect(result.topProducts[0].totalRevenue).toBe(100000);

      // Test sales over time
      expect(result.salesOverTime.length).toBe(1);
      expect(result.salesOverTime[0].totalSales).toBe(100000);
    });
  });

  describe('generateCSV', () => {
    it('should generate a CSV string correctly', () => {
      const csv = reportsService.generateCSV(mockTransactions);
      expect(csv).toContain('Kode Transaksi,Tanggal,Kasir,Pelanggan');
      expect(csv).toContain('TX-20260630-111111');
      expect(csv).toContain('Kasir Satu');
      expect(csv).toContain('Budi');
    });
  });
});
