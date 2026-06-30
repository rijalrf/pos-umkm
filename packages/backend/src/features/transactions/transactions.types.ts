export interface CreateTransactionItemInput {
  productId: string;
  quantity: number;
}

export interface CreateTransactionInput {
  customerId?: string;
  customerName?: string;
  items: CreateTransactionItemInput[];
  cashReceived: number;
}
