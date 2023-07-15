import { sensitiveCookieOptions } from './../config/vars';
/* eslint-disable no-undef */

import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
// import APIError from '../errors/api.error';
// import { Promise } from 'bluebird';

import { _MSG } from '../utils/messages';
import { RequestCustom } from '../types/custom-express/express-custom';
import passport from 'passport';
import { USER_ROLES } from '../types/enum/enum';
// import { getEntity, getEntityFromOriginalUrl } from '../utils/functions';
import { ObjectId } from 'mongodb';
import Organization from '../models/Organization';
import logger from '../config/logger';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';
import { IUser } from '../types/mongoose-types/model-types/user-interface';

export const isLoggedIn =
  (roles: USER_ROLES[] = USER_ROLES) =>
  async (req: RequestCustom, res: Response, next: NextFunction) => {
    if (roles.includes(req.user?.role)) {
      return next();
    }
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: _MSG.NOT_AUTHORIZED,
      user: null
    });
    // throw Error('user not authorized');
  };

export const handleUserFromRequest = (req: RequestCustom, res: Response, next: NextFunction) =>
  passport.authenticate('jwt', { session: false }, setUserInRequest(req, res, next))(req, res, next);

// if user is present frm jwt token then set it to req.user
// if not just pass without setting req.user
const setUserInRequest = (req: RequestCustom, res: Response, next: NextFunction) => async (err: any, user: IUser & boolean, info: any) => {
  // define case for login route the user is false. call next to login the user
  if (user === false) {
    return next();
  }
  const error = err || info;
  // const logIn = Promise.promisify(req.logIn);
  // const apiError = new APIError({
  //   message: error ? error.message : 'Unauthorized',
  //   status: httpStatus.UNAUTHORIZED,
  //   stack: error ? error.stack : undefined
  // });

  // try {
  //   if (error) throw error;
  //   await logIn(user /*,  { session: false } */);
  // } catch (e) {
  //   return next(apiError);
  // }
  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error('user not found');
  }

  req.user = user;

  return next();
};

const setQueries = (req: RequestCustom, res: Response, next: NextFunction) => async (err: any, space: ISpace & boolean) => {
  try {
    req.space = space;

    // if space is present set organization and space in query
    if (req.space) {
      req.query.space = req.space._id;
      req.query.organization = req.space.organization;
    }

    if (!req.query.organization && req.cookies.organization) {
      req.query.organization = new ObjectId(req.cookies.organization);
      req.body.organization = new ObjectId(req.cookies.organization);
      req.organization = await Organization.findById(req.cookies.organization);
    }

    if (req.user?.role !== 'super_admin' && space) {
      // watch out for this line for maintainer model. now they are model but can be changed to users.
      req.body.space = space?._id;
    }

    if (req.user?.role !== 'super_admin' && !req.query.organization) {
      res.clearCookie('jwt', sensitiveCookieOptions);
      // throw new Error('organization cookie is not set. select organization first');
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

export const handleQuery = (req: RequestCustom, res: Response, next: NextFunction) =>
  passport.authenticate('handleSpaceJwt', { session: false }, setQueries(req, res, next))(req, res, next);

export function clearQueriesForSAdmin(req: RequestCustom, res: Response, next: NextFunction) {
  if (req.user.role === 'super_admin') {
    delete req.query.organization;
    delete req.query.space;
  }
  next();
}
export function checkSSGSecret(req: RequestCustom, res: Response, next: NextFunction) {
  if (req.query.ssg_secret !== process.env.SSG_SECRET) {
    next('route');
    return;
  }
  next();
}

export const ADMIN = 'admin';
export const LOGGED_USER = 'user';
export const SUPER_ADMIN = 'super_admin';
