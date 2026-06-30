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
}
