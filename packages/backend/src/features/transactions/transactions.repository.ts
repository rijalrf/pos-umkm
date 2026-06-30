import { prisma } from '../../config/database.config';
import { Transaction, TransactionItem } from '@prisma/client';

export type TransactionWithDetails = Transaction & {
  items: (TransactionItem & {
    product: {
      name: string;
      sku: string;
    };
  })[];
  cashier: {
    username: string;
    fullName: string;
  };
  customer: {
    email: string;
    name: string;
  } | null;
};

export class TransactionsRepository {
  async findById(id: string): Promise<TransactionWithDetails | null> {
    return prisma.transaction.findUnique({
      where: { id },
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
    }) as Promise<TransactionWithDetails | null>;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: TransactionWithDetails[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.search) {
      where.OR = [
        { transactionCode: { contains: options.search, mode: 'insensitive' } },
        { customerName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.startDate || options.endDate) {
      where.transactionDate = {};
      if (options.startDate) {
        where.transactionDate.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        const end = new Date(options.endDate);
        end.setHours(23, 59, 59, 999);
        where.transactionDate.lte = end;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
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
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions as TransactionWithDetails[],
      total,
    };
  }
}
