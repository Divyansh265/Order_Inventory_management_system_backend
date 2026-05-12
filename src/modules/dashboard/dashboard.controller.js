import { getStats as getStatsService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await getStatsService();
    return sendSuccess(res, 'Dashboard stats fetched successfully', stats);
  } catch (err) {
    next(err);
  }
};
