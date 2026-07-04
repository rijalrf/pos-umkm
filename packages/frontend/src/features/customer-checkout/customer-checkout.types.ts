export interface StoreInfoData {
  storeName: string;
  address?: string;
  logoUrl?: string | null;
  qrisUrl?: string | null;
}

export interface CheckoutPayload {
  customerType: 'guest' | 'member_register';
  guestName?: string;
  phone?: string;
  memberData?: { email: string; password?: string; name: string; phone?: string; address?: string };
  items: { productId: string; quantity: number }[];
  tableId?: string;
  paymentMethod?: string;
}

export interface CheckoutResult {
  id: string;
  transactionCode: string;
  code?: string;
  items: Array<{
    id: string;
    product?: { name: string; price: string };
    name?: string;
    quantity: number;
    priceAtPurchase?: string | number;
  }>;
  customerName?: string;
  paymentMethod?: string;
  totalAmount: string | number;
}
