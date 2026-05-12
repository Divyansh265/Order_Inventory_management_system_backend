import * as productService from './product.service.js';
import { sendSuccess } from '../../utils/response.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, 'Product created successfully', product, 201);
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    return sendSuccess(res, 'Products fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));
    return sendSuccess(res, 'Product fetched successfully', product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(parseInt(req.params.id), req.body);
    return sendSuccess(res, 'Product updated successfully', product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id));
    return sendSuccess(res, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};
