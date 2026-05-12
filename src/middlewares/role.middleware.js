import { sendError } from '../utils/response.js';

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return sendError(res, 'Unauthorized', 401);
  if (!roles.includes(req.user.role)) return sendError(res, 'Forbidden: insufficient permissions', 403);
  next();
};
