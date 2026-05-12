import { Router } from 'express';
import * as productController from './product.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema } from './product.validation.js';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('admin'), validate(createProductSchema), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.patch('/:id', requireRole('admin'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', requireRole('admin'), productController.deleteProduct);

export default router;
