import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be positive'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
});
