import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';
import { TransactionWithDetails } from './transactions.types';
import { CreateTransactionInput } from './transactions.schema';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors.util';

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
        table: {
          select: {
            code: true,
            number: true,
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
          table: {
            select: {
              code: true,
              number: true,
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

  async createTransaction(
    cashierId: string,
    transactionCode: string,
    customerName: string | null,
    data: CreateTransactionInput
  ): Promise<TransactionWithDetails> {
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const itemsToCreate = [];

      for (const item of data.items) {
        // Lock product row to prevent concurrent stock issues
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundError(`Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        // Calculate pricing
        const price = Number(product.price);
        const subtotal = price * item.quantity;
        totalAmount += subtotal;

        // Deduct stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity,
          },
        });

        itemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: new Prisma.Decimal(price),
          subtotal: new Prisma.Decimal(subtotal),
        });
      }

      let cashReceivedVal = data.cashReceived;
      let cashReturnVal = 0;
      const status = data.status || 'PAID';

      if (status === 'PENDING') {
        cashReceivedVal = 0;
        cashReturnVal = 0;
      } else {
        if (data.cashReceived < totalAmount) {
          throw new BadRequestError(
            `Insufficient cash received. Total: Rp ${totalAmount}, Received: Rp ${data.cashReceived}`
          );
        }
        cashReturnVal = data.cashReceived - totalAmount;
      }

      // Create transaction
      const createdTx = await tx.transaction.create({
        data: {
          transactionCode,
          customerId: data.customerId || null,
          customerName,
          cashierId,
          tableId: data.tableId || null,
          tableNumber: data.tableNumber || null,
          paymentMethod: data.paymentMethod || 'CASH',
          status,
          totalAmount: new Prisma.Decimal(totalAmount),
          cashReceived: new Prisma.Decimal(cashReceivedVal),
          cashReturn: new Prisma.Decimal(cashReturnVal),
          items: {
            create: itemsToCreate,
          },
        },
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
          table: {
            select: {
              code: true,
              number: true,
            },
          },
        },
      });

      return createdTx as TransactionWithDetails;
    });
  }

  async updateTransactionStatus(
    id: string,
    cashierId: string,
    paymentMethod: string,
    cashReceived: number,
    cashReturn: number
  ): Promise<TransactionWithDetails> {
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'PAID',
        cashierId,
        paymentMethod,
        cashReceived: new Prisma.Decimal(cashReceived),
        cashReturn: new Prisma.Decimal(cashReturn),
      },
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
        table: {
          select: {
            code: true,
            number: true,
          },
        },
      },
    });

    return updated as TransactionWithDetails;
  }
}
