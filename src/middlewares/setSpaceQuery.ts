import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../config/logger';
import { RequestCustom } from '../types/custom-express/express-custom';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';

// called in handleQuery middleware.
export const setSpaceQuery = (req: RequestCustom, res: Response, next: NextFunction) => async (err: any, space: ISpace & boolean) => {
  try {
    req.space = space;
    //case user
    if (req.user?.role === 'user' && !req.space) {
      throw new Error('space not found');
    }
    // super_admin can pass without space
    if (req.space) {
      req.query.space = req.space._id;
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
