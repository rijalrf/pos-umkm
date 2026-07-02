import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    customerName: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid Product ID'),
          quantity: z.number().int().positive('Quantity must be at least 1'),
        })
      )
      .min(1, 'At least one item is required'),
    cashReceived: z.number().nonnegative('Cash received must be 0 or greater'),
    paymentMethod: z.string().optional(),
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Transaction ID'),
  }),
});

export const getTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type GetTransactionsQuery = z.infer<typeof getTransactionsSchema>['query'];
