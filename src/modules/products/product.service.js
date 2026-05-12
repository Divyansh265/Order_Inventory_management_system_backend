import prisma from '../../config/prisma.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

export const createProduct = async (data) => {
  const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existing) {
    const err = new Error('A product with this SKU already exists');
    err.statusCode = 409;
    throw err;
  }
  return prisma.product.create({ data });
};

export const getProducts = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
  if (query.sku) where.sku = { contains: query.sku, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: buildPaginationMeta(total, page, limit) };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

export const updateProduct = async (id, data) => {
  if (data.sku) {
    const existing = await prisma.product.findFirst({ where: { sku: data.sku, NOT: { id } } });
    if (existing) {
      const err = new Error('A product with this SKU already exists');
      err.statusCode = 409;
      throw err;
    }
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.product.update({ where: { id }, data });
};

export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    const err = new Error('Cannot delete this product — it is referenced by existing orders');
    err.statusCode = 409;
    throw err;
  }

  return prisma.product.delete({ where: { id } });
};
