import { ProductsRepository } from '../products/products.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { SettingsRepository } from '../settings/settings.repository';
import { GetProductsQuery } from '../products/products.schema';
import { PublicCheckoutInput } from './public.schema';
import { CustomersService } from '../customers/customers.service';
import { TransactionsService } from '../transactions/transactions.service';
import { prisma } from '../../config/database.config';
import { BadRequestError, NotFoundError } from '../../shared/utils/errors.util';
import { hashPassword } from '../../shared/utils/bcrypt.util';

export class PublicService {
  private productsRepository = new ProductsRepository();
  private categoriesRepository = new CategoriesRepository();
  private settingsRepository = new SettingsRepository();
  private customersService = new CustomersService();
  private transactionsService = new TransactionsService();

  async getProducts(query: GetProductsQuery) {
    return this.productsRepository.findAndCount(query);
  }

  async getProductById(id: string) {
    return this.productsRepository.findById(id);
  }

  async getCategories() {
    return this.categoriesRepository.findAll();
  }

  async getStoreInfo() {
    const setting = await this.settingsRepository.getStoreSetting();
    return {
      storeName: setting.storeName,
      address: setting.address,
      phone: setting.phone,
      logoUrl: setting.logoUrl ?? null,
      qrisUrl: setting.qrisUrl ?? null,
    };
  }

  async getTableById(idOrCode: string) {
    let table = await prisma.table.findUnique({
      where: { id: idOrCode },
    });
    
    if (!table) {
      table = await prisma.table.findUnique({
        where: { code: idOrCode },
      });
    }

    if (!table || table.status !== 'ACTIVE') {
      throw new BadRequestError('Meja tidak ditemukan atau tidak aktif');
    }
    return {
      id: table.id,
      number: table.number,
      code: table.code,
      status: table.status,
    };
  }

  async checkout(input: PublicCheckoutInput) {
    let customerId: string | undefined;
    let customerName: string | undefined;

    if (input.customerType === 'member_register') {
      if (!input.memberData) {
        throw new BadRequestError('Member data is required for registration checkout');
      }
      const customer = await this.customersService.register(input.memberData);
      customerId = customer.id;
      customerName = customer.name;
    } else {
      if (!input.guestName) {
        throw new BadRequestError('Guest name is required for guest checkout');
      }
      customerName = input.guestName;

      const cleanPhone = input.phone ? input.phone.trim() : '';
      if (cleanPhone) {
        // Cek apakah pelanggan dengan nomor telepon ini sudah terdaftar
        let customer = await prisma.customer.findFirst({
          where: { phone: cleanPhone },
        });

        if (!customer) {
          // Jika belum ada, daftarkan sebagai pelanggan baru.
          // Karena email unik dan password hash wajib di skema database, buat email & password dummy.
          const dummyEmail = `${cleanPhone}@pos-umkm.local`;
          const dummyPassword = `pass-${cleanPhone}`;
          const passwordHash = await hashPassword(dummyPassword);

          customer = await prisma.customer.create({
            data: {
              email: dummyEmail,
              passwordHash,
              name: input.guestName,
              phone: cleanPhone,
              isEmailVerified: true, // Otomatis terverifikasi
            },
          });
        } else {
          // Jika sudah ada, update namanya jika berbeda
          if (customer.name !== input.guestName) {
            customer = await prisma.customer.update({
              where: { id: customer.id },
              data: { name: input.guestName },
            });
          }
        }

        customerId = customer.id;
        customerName = customer.name;
      }
    }

    let tableNumber: string | undefined;
    if (input.tableId) {
      const table = await prisma.table.findUnique({
        where: { id: input.tableId },
      });
      if (!table || table.status !== 'ACTIVE') {
        throw new BadRequestError('Meja tidak aktif atau tidak ditemukan');
      }
      tableNumber = table.number;
    }

    const cashier = await prisma.user.findFirst({
      where: { isActive: true },
      orderBy: { role: 'asc' }, // Get any active cashier
    });

    if (!cashier) {
      throw new BadRequestError('No active cashier/admin found to process transaction');
    }

    let totalAmount = 0;
    for (const item of input.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new BadRequestError(`Product not found: ${item.productId}`);
      }
      totalAmount += Number(product.price) * item.quantity;
    }

    const tx = await this.transactionsService.createTransaction(cashier.id, {
      customerId,
      customerName,
      tableId: input.tableId,
      tableNumber,
      items: input.items,
      cashReceived: totalAmount,
      paymentMethod: input.paymentMethod || 'CASH',
      paymentStatus: 'UNPAID',
      orderStatus: 'PENDING',
    });

    return tx;
  }

  async getTransactionById(id: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                price: true,
              },
            },
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

    if (!tx) {
      throw new NotFoundError('Transaksi tidak ditemukan');
    }

    return tx;
  }
}
