import { z } from 'zod';

export const authorizeGDriveSchema = z.object({
  body: z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    clientSecret: z.string().min(1, 'Client Secret is required'),
  }),
});

export const updateStoreSettingsSchema = z.object({
  body: z.object({
    storeName: z.string().min(1, 'Store name is required').max(100),
    address: z.string().min(1, 'Address is required').max(200),
    phone: z.string().min(1, 'Phone is required').max(20),
    email: z.string().email('Invalid email').optional().nullable(),
    currency: z.string().min(1).max(10).default('IDR'),
    timezone: z.string().min(1).max(50).default('Asia/Jakarta'),
    dateFormat: z.string().min(1).max(50).default('DD/MM/YYYY'),
  }),
});

export type AuthorizeGDriveInput = z.infer<typeof authorizeGDriveSchema>['body'];
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>['body'];
