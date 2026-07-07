export interface CreateTransactionPayload {
  customerId?: string;
  customerName?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  cashReceived: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  tableCode?: string;
}

export interface TransactionItem {
  id: string;
  transactionCode: string;
  transactionDate: string;
  totalAmount: number;
  cashReceived: number;
  cashReturn: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  customerName: string | null;
  tableNumber: string | null;
  table?: { code: string; number: string } | null;
  cashier: { id: string; fullName: string } | null;
  items: TransactionItemDetail[];
}

export interface TransactionItemDetail {
  id: string;
  product: { id: string; name: string; sku: string; price: string };
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}
