import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';

export class ReportsRepository {
  async getTransactions(startDate?: Date, endDate?: Date) {
    const where: Prisma.TransactionWhereInput = {};

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = startDate;
      }
      if (endDate) {
        where.transactionDate.lte = endDate;
      }
    }

    return prisma.transaction.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        cashier: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        table: {
          select: {
            id: true,
            code: true,
            number: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });
  }
}
