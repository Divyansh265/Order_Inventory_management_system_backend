import { Router } from 'express';
import * as orderController from './order.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', requireRole('admin'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
