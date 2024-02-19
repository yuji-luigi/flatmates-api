import { NextFunction, Response } from 'express';
import passport from 'passport';
import { RequestCustom } from '../types/custom-express/express-custom';
import logger from '../lib/logger';
import httpStatus from 'http-status';
import { ReqUser } from '../lib/jwt/jwtTypings';

export const handleUserFromRequest = (req: RequestCustom, res: Response, next: NextFunction) =>
  passport.authenticate('jwt', { session: false }, setUserInRequest(req, res, next))(req, res, next);

export type UserResolverReturnType = (err: any, user: ReqUser | boolean, info?: any) => void;
// if user is present frm jwt token then set it to req.user
// if not just pass without setting req.user
const setUserInRequest = (req: RequestCustom, res: Response, next: NextFunction) => async (error: any, reqUser: ReqUser & boolean, info: any) => {
  try {
    if (reqUser === false) {
      return next();
    }
    if (error) {
      // error from resolveJwt middlewares
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized'
      });
    }
    if (info) {
      throw info;
    }
    if (!reqUser) {
      throw new Error('user not found');
    }

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
