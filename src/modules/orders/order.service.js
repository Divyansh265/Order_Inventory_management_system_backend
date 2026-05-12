import prisma from '../../config/prisma.js';
import generateOrderNumber from '../../utils/generateOrderNumber.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

const VALID_STATUSES = ['pending', 'completed', 'cancelled'];

export const createOrder = async (items, userId) => {
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      const err = new Error(`Product with ID ${item.productId} not found`);
      err.statusCode = 404;
      throw err;
    }
    if (product.stockQuantity < item.quantity) {
      const err = new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    totalAmount += parseFloat(product.price) * item.quantity;
    return { productId: item.productId, quantity: item.quantity, price: product.price };
  });

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        totalAmount,
        createdById: userId,
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { product: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    return order;
  });
};

export const getOrders = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.status && VALID_STATUSES.includes(query.status)) {
    where.status = query.status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, meta: buildPaginationMeta(total, page, limit) };
};

export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      orderItems: { include: { product: true } },
    },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  return order;
};

export const updateOrderStatus = async (id, status) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.order.update({ where: { id }, data: { status } });
};
