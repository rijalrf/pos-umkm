import { z } from 'zod';

export const createTableSchema = z.object({
  body: z.object({
    number: z.string().min(1, 'Nomor meja harus diisi').max(50),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const updateTableSchema = z.object({
  body: z.object({
    number: z.string().min(1, 'Nomor meja harus diisi').max(50).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});

export const getTableByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});

export const deleteTableSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});

export type CreateTableInput = z.infer<typeof createTableSchema>['body'];
export type UpdateTableInput = z.infer<typeof updateTableSchema>['body'];
