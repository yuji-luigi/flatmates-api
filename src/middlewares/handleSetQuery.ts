import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../config/logger';
import { RequestCustom } from '../types/custom-express/express-custom';
import { _MSG } from '../utils/messages';

// called in handleQuery middleware.
export function queryHandler(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    // case admin: at least organizationId is required
    if (req.user.role === 'admin' && !req.user.organizationId) {
      throw new Error('organization not found');
    }
    // case user: at least spaceId is required
    if (req.user.role === 'user' && !req.user.spaceId) {
      throw new Error('space not found');
    }

    if (req.user.spaceId) {
      req.query.space = req.user.spaceId;

      // only for users
      // req.query.rootSpaces = req.user.spaceId;
    }
    if (req.user.organizationId) {
      req.query.organization = req.user.organizationId;
      // only for users and maintainers
      // req.query.organizations = req.user.organizationId;
    }

    return next();
  } catch (error) {
    logger.error(error.message || error);
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: _MSG.NOT_AUTHORIZED,
      user: null
    });
  }
}
