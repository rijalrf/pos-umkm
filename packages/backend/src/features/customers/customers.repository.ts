import { prisma } from '../../config/database.config';
import { Customer } from '@prisma/client';
import { RegisterCustomerInput } from './customers.schema';

export class CustomersRepository {
  async findByEmail(email: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { phone },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id },
    });
  }

  async findByVerifyToken(token: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { emailVerifyToken: token },
    });
  }

  async create(data: RegisterCustomerInput['body'] & { passwordHash: string; emailVerifyToken: string; emailVerifyExpiry: Date }): Promise<Customer> {
    return prisma.customer.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        emailVerifyToken: data.emailVerifyToken,
        emailVerifyExpiry: data.emailVerifyExpiry,
      },
    });
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async findAll(): Promise<Customer[]> {
    return prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findTransactionsByCustomerId(customerId: string) {
    return prisma.transaction.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });
  }
}
