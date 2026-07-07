import { Transaction, TransactionItem } from '@prisma/client';

export type TransactionWithDetails = Transaction & {
  items: (TransactionItem & {
    product: {
      name: string;
      sku: string;
    };
  })[];
  cashier: {
    username: string;
    fullName: string;
  };
  customer: {
    email: string;
    name: string;
  } | null;
  table: {
    code: string;
    number: string;
  } | null;
};
