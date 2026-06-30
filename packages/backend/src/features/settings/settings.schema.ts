import { z } from 'zod';

export const authorizeGDriveSchema = z.object({
  body: z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    clientSecret: z.string().min(1, 'Client Secret is required'),
  }),
});

export type AuthorizeGDriveInput = z.infer<typeof authorizeGDriveSchema>['body'];
