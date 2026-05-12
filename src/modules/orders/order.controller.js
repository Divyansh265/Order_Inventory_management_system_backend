import * as orderService from './order.service.js';
import { sendSuccess } from '../../utils/response.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body.items, req.user.id);
    return sendSuccess(res, 'Order created successfully', order, 201);
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getOrders(req.query);
    return sendSuccess(res, 'Orders fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(parseInt(req.params.id));
    return sendSuccess(res, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(parseInt(req.params.id), req.body.status);
    return sendSuccess(res, 'Order status updated successfully', order);
  } catch (err) {
    next(err);
  }
};
