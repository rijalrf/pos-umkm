import { TransactionsRepository } from './transactions.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { SettingsRepository } from '../settings/settings.repository';
import { CreateTransactionInput } from './transactions.schema';
import { BadRequestError, NotFoundError } from '../../shared/utils/errors.util';
import { generateReceiptHtml } from '../../shared/utils/receipt-template.util';

export class TransactionsService {
  private repository = new TransactionsRepository();
  private customersRepository = new CustomersRepository();
  private settingsRepository = new SettingsRepository();

  async getAllTransactions(query: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.repository.findAll(query);
  }

  async getTransactionById(id: string) {
    const tx = await this.repository.findById(id);
    if (!tx) {
      throw new NotFoundError('Transaction not found');
    }
    return tx;
  }

  async createTransaction(cashierId: string, data: CreateTransactionInput) {
    // Generate transaction code: TX-YYYYMMDD-[6 random digits]
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const transactionCode = `TX-${dateStr}-${randomDigits}`;

    // Verify customer if customerId provided
    let customerName = data.customerName || null;
    if (data.customerId) {
      const customer = await this.customersRepository.findById(data.customerId);
      if (!customer) {
        throw new BadRequestError('Invalid Customer ID');
      }
      customerName = customer.name;
    }

    return this.repository.createTransaction(cashierId, transactionCode, customerName, data);
  }

  async getReceiptHtml(id: string): Promise<string> {
    const tx = await this.getTransactionById(id);
    const store = await this.settingsRepository.getStoreSetting();
    return generateReceiptHtml(tx, store);
  }

  async payPendingTransaction(id: string, cashierId: string, data: { cashReceived: number; paymentMethod: string }) {
    const tx = await this.getTransactionById(id);
    if (tx.status !== 'PENDING') {
      throw new BadRequestError('Transaction is already paid or not pending');
    }

    const total = Number(tx.totalAmount);
    const paymentMethod = data.paymentMethod;
    let cashReceivedVal = data.cashReceived;
    let cashReturnVal = 0;

    if (paymentMethod === 'QRIS' || paymentMethod === 'DEBIT' || paymentMethod === 'TRANSFER') {
      cashReceivedVal = total;
      cashReturnVal = 0;
    } else {
      if (data.cashReceived < total) {
        throw new BadRequestError(
          `Insufficient cash received. Total: Rp ${total}, Received: Rp ${data.cashReceived}`
        );
      }
      cashReturnVal = data.cashReceived - total;
    }

    return this.repository.updateTransactionStatus(id, cashierId, paymentMethod, cashReceivedVal, cashReturnVal);
  }
}
