import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../lib/logger';
import { RequestCustom } from '../types/custom-express/express-custom';
import { _MSG } from '../utils/messages';

// called in handleQuery middleware.
export function queryHandler(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    // todo: set the query to req.query

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
