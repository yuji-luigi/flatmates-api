import { NextFunction, Response } from 'express';
import passport from 'passport';
import { RequestCustom } from '../types/custom-express/express-custom';
import { JwtReturnType } from '../config/passport';

export const handleUserFromRequest = (req: RequestCustom, res: Response, next: NextFunction) =>
  passport.authenticate('jwt', { session: false }, setUserInRequest(req, res, next))(req, res, next);

// if user is present frm jwt token then set it to req.user
// if not just pass without setting req.user
const setUserInRequest = (req: RequestCustom, res: Response, next: NextFunction) => async (err: any, user: JwtReturnType & boolean, info: any) => {
  // define case for login route the user is false. call next to login the user
  if (user === false) {
    return next();
  }
  const error = err || info;

  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error('user not found');
  }
  if (req.user.role === 'admin' && !user.organizationId) {
    throw new Error('organization not found');
  }
  if (req.user.role === 'user' && !user.spaceId) {
    throw new Error('space not found');
  }

  if (user.spaceId) {
    req.query.space = user.spaceId;
  }
  if (user.organizationId) {
    req.query.organization = user.organizationId;
  }
  req.user = user;

  return next();
};
