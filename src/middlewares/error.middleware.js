import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  if (!err.statusCode || err.statusCode >= 500) {
    console.error(`[Error] ${err.message}`);
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, `Duplicate value: ${field} already exists`, 409);
  }
  if (err.code === 'P2025') return sendError(res, 'Record not found', 404);
  if (err.code === 'P2003') return sendError(res, 'Cannot delete — this record is referenced by existing data', 409);

  if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token', 401);
  if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired', 401);

  if (err.statusCode) return sendError(res, err.message, err.statusCode);

  return sendError(res, 'Internal server error', 500);
};
