import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive('Product ID must be a positive integer'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'Order must have at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be pending, completed, or cancelled' }),
  }),
});
