import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../lib/logger';
import { RequestCustom } from '../types/custom-express/express-custom';
import { _MSG } from '../utils/messages';
import { ErrorCustom } from '../lib/ErrorCustom';

// called in handleQuery middleware.
export function queryHandler(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    // SET BASE QUERY. HANDLE FOR EACH ENTITY EX THREAD ACCEPTS SPACES: { $IN: [SPACE_ID] }
    if (!req.user) {
      throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
    }
    if (req.user.currentSpace?._id) {
      // forcing the space to be the currentSpace of the user in server side client can't change it.
      req.query = { ...req.query, space: req.user.currentSpace._id };
    }
    // todo: set the query to req.query
    if (!req.user.isSuperAdmin && !req.user.accessPermissions?.length && req.user.loggedAs.name !== 'maintainer') {
      throw new Error('User without accessPermission.');
    }
    if (req.user.isSuperAdmin && !req.user.accessPermissions?.length) {
      return next();
    }
    req.query = { ...req.query, space: req.query.space || { $in: req.user.accessPermissions?.map((ac) => ac.space) } };

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
