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
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Transaction ID'),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
