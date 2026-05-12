import { login as loginService, refreshTokens } from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const login = async (req, res, next) => {
  try {
    const result = await loginService(req.body.email, req.body.password);
    return sendSuccess(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

export const getMe = (req, res) => {
  return sendSuccess(res, 'User fetched successfully', req.user);
};

export const refresh = async (req, res, next) => {
  try {
    const tokens = refreshTokens(req.body.refreshToken);
    return sendSuccess(res, 'Tokens refreshed', tokens);
  } catch {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};
