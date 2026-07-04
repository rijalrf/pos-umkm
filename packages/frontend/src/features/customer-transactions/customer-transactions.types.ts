export interface TransactionItem {
  product: { name: string; price: string };
  quantity: number;
  priceAtPurchase: string | number;
}

export interface TransactionRecord {
  id: string;
  transactionCode: string;
  code?: string;
  transactionDate: string;
  items: TransactionItem[];
  totalAmount: string | number;
  cashReceived: string | number;
  cashReturn: string | number;
  customerName?: string;
  paymentMethod?: string;
}
