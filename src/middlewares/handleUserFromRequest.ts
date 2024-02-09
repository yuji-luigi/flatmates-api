import { NextFunction, Response } from 'express';
import passport from 'passport';
import { RequestCustom } from '../types/custom-express/express-custom';
import logger from '../lib/logger';
import httpStatus from 'http-status';
import { ReqUser } from '../lib/jwt/jwtTypings';

export const handleUserFromRequest = (req: RequestCustom, res: Response, next: NextFunction) =>
  passport.authenticate('jwt', { session: false }, setUserInRequest(req, res, next))(req, res, next);

// if user is present frm jwt token then set it to req.user
// if not just pass without setting req.user
const setUserInRequest = (req: RequestCustom, res: Response, next: NextFunction) => async (err: any, reqUser: ReqUser & boolean, info: any) => {
  try {
    if (reqUser === false) {
      return next();
    }
    const error = err || info;

    if (error) {
      throw error;
    }
    if (!reqUser) {
      throw new Error('user not found');
    }
    // if (user.role === 'admin' && !user.organizationId) {
    //   throw new Error('organization not found');
    // }
    // if (user.role === 'user' && !user.spaceId) {
    //   throw new Error('space not found');
    // }

    // if (user.spaceId) {
    //   req.query.space = user.spaceId;
    // }
    // if (user.organizationId) {
    //   req.query.organization = user.organizationId;
    // }
    req.user = reqUser;
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
