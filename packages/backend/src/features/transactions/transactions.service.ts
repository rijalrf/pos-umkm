import { prisma } from '../../config/database.config';
import { TransactionsRepository } from './transactions.repository';
import { CreateTransactionInput } from './transactions.types';
import { BadRequestError, NotFoundError } from '../../shared/utils/errors.util';
import { Prisma } from '@prisma/client';

export class TransactionsService {
  private repository = new TransactionsRepository();

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
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) {
        throw new BadRequestError('Invalid Customer ID');
      }
      customerName = customer.name;
    }

    // Run DB transaction
    const transaction = await prisma.$transaction(async (tx) => {
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

      if (data.cashReceived < totalAmount) {
        throw new BadRequestError(
          `Insufficient cash received. Total: Rp ${totalAmount}, Received: Rp ${data.cashReceived}`
        );
      }

      const cashReturn = data.cashReceived - totalAmount;

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
          totalAmount: new Prisma.Decimal(totalAmount),
          cashReceived: new Prisma.Decimal(data.cashReceived),
          cashReturn: new Prisma.Decimal(cashReturn),
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
        },
      });

      return createdTx;
    });

    return transaction;
  }

  async getReceiptHtml(id: string): Promise<string> {
    const tx = await this.getTransactionById(id);
    const store = await prisma.storeSetting.findFirst() || {
      storeName: 'POS UMKM',
      address: 'Alamat Toko',
      phone: '081234567890',
    };

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });

    const itemsHtml = tx.items.map(item => `
      <div class="item-row" style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>${item.product.name} (x${item.quantity})</span>
        <span>${formatter.format(Number(item.priceAtPurchase) * item.quantity)}</span>
      </div>
      <div class="item-price-unit" style="font-size: 10px; color: #555; margin-bottom: 4px;">
        ${item.quantity} x ${formatter.format(Number(item.priceAtPurchase))}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt ${tx.transactionCode}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
            color: #000;
            font-size: 12px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .header { margin-bottom: 10px; }
          .header .title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .total-section { margin-top: 8px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .footer { margin-top: 15px; font-size: 10px; }
        </style>
      </head>
      <body onload="window.print()">
        <div class="header text-center">
          <div class="title">${store.storeName}</div>
          <div>${store.address}</div>
          <div>Telp: ${store.phone}</div>
        </div>
        
        <div class="divider"></div>
        
        <div>
          <div>No: ${tx.transactionCode}</div>
          <div>Tgl: ${tx.transactionDate.toLocaleString('id-ID')}</div>
          <div>Kasir: ${tx.cashier.fullName}</div>
          ${tx.customerName ? `<div>Pelanggan: ${tx.customerName}</div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <div class="items">
          ${itemsHtml}
        </div>
        
        <div class="divider"></div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Total</span>
            <span>${formatter.format(Number(tx.totalAmount))}</span>
          </div>
          <div class="total-row">
            <span>Bayar</span>
            <span>${formatter.format(Number(tx.cashReceived))}</span>
          </div>
          <div class="total-row bold">
            <span>Kembali</span>
            <span>${formatter.format(Number(tx.cashReturn))}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer text-center">
          <div>Terima Kasih atas Kunjungan Anda</div>
          <div>Layanan Pelanggan POS UMKM</div>
        </div>
      </body>
      </html>
    `;
  }
}
