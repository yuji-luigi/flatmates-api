import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../config/logger';
import { RequestCustom } from '../types/custom-express/express-custom';

// called in handleQuery middleware.
export function queryHandler(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    if (req.user.role === 'admin' && !req.user.organizationId) {
      throw new Error('organization not found');
    }
    if (req.user.role === 'user' && !req.user.spaceId) {
      throw new Error('space not found');
    }

    if (req.user.spaceId) {
      req.query.space = req.user.spaceId;
    }
    if (req.user.organizationId) {
      req.query.organization = req.user.organizationId;
    }
    return next();
  } catch (error) {
    logger.error(error.message || error);
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: error.message,
      user: null
    });
  }
}
