import prisma from '../../config/prisma.js';

export const getStats = async () => {
  const [totalProducts, totalOrders, lowStockProducts, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.product.findMany({
      where: { stockQuantity: { lte: 10 } },
      select: { id: true, name: true, sku: true, stockQuantity: true },
      orderBy: { stockQuantity: 'asc' },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
        orderItems: true,
      },
    }),
  ]);

  return { totalProducts, totalOrders, lowStockProducts, recentOrders };
};
