import { TransactionWithDetails } from '../../features/transactions/transactions.types';

export const generateReceiptHtml = (
  tx: TransactionWithDetails,
  store: { storeName: string; address: string; phone: string }
): string => {
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
};
