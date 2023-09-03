import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../config/logger';
import { RequestCustom } from '../types/custom-express/express-custom';

// called in handleQuery middleware.
export const setOrganizationQuery = (req: RequestCustom, res: Response, next: NextFunction) => async (err: any, organization: string & boolean) => {
  try {
    req.organization = organization;
    //case user
    if ((req.user?.role === 'user' || req.user?.role === 'admin') && !req.organization) {
      throw new Error('organization not found in cookie');
    }
    // super_admin can pass without space
    if (req.organization) {
      req.query.organization = req.organization._id;
    }
    return next();
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: error.message,
      user: null
    });
  }
};
