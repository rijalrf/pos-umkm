export interface CreateTransactionItemInput {
  productId: string;
  quantity: number;
}

export interface CreateTransactionInput {
  customerId?: string;
  customerName?: string;
  tableId?: string;
  tableNumber?: string;
  items: CreateTransactionItemInput[];
  cashReceived: number;
}
