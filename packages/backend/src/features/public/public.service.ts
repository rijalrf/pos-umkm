import { ProductsRepository } from '../products/products.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { SettingsRepository } from '../settings/settings.repository';
import { GetProductsQuery } from '../products/products.schema';
import { PublicCheckoutInput } from './public.schema';
import { CustomersService } from '../customers/customers.service';
import { TransactionsService } from '../transactions/transactions.service';
import { prisma } from '../../config/database.config';
import { BadRequestError } from '../../shared/utils/errors.util';

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
    };
  }

  async getTableById(id: string) {
    const table = await prisma.table.findUnique({
      where: { id },
    });
    if (!table || table.status !== 'ACTIVE') {
      throw new BadRequestError('Meja tidak ditemukan atau tidak aktif');
    }
    return {
      id: table.id,
      number: table.number,
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
    });

    return tx;
  }
}
