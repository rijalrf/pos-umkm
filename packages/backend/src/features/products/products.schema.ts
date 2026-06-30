import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    sku: z.string().min(1).max(100),
    categoryId: z.string().uuid(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    description: z.string().optional(),
    stockAlertThreshold: z.number().int().min(0).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    sku: z.string().min(1).max(100).optional(),
    categoryId: z.string().uuid().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    description: z.string().optional(),
    stockAlertThreshold: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type GetProductsQuery = z.infer<typeof getProductsSchema>['query'];
