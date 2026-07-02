import { z } from 'zod';

export const publicCheckoutSchema = z.object({
  body: z.object({
    customerType: z.enum(['guest', 'member_register']),
    guestName: z.string().optional(),
    memberData: z
      .object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().min(1, 'Name is required'),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
      .optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid Product ID'),
          quantity: z.number().int().positive('Quantity must be at least 1'),
        })
      )
      .min(1, 'At least one item is required'),
    tableId: z.string().uuid('Invalid Table ID').optional(),
    paymentMethod: z.string().optional(),
  }),
});

export type PublicCheckoutInput = z.infer<typeof publicCheckoutSchema>['body'];
