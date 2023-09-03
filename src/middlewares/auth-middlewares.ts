import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';

import { _MSG } from '../utils/messages';
import { RequestCustom } from '../types/custom-express/express-custom';
import passport from 'passport';
import { ObjectId } from 'mongodb';

import { setSpaceQuery } from './setSpaceQuery';

export const parseSpaceJwt = (req: RequestCustom, res: Response, next: NextFunction) =>
  passport.authenticate('handleSpaceJwt', { session: false }, setSpaceQuery(req, res, next))(req, res, next);

export const parseOrganizationJwt = (req: RequestCustom, res: Response, next: NextFunction) =>
  passport.authenticate('handleOrganizationJwt', { session: false }, setSpaceQuery(req, res, next))(req, res, next);

export function clearQueriesForSAdmin(req: RequestCustom, res: Response, next: NextFunction) {
  if (req.user.role === 'super_admin') {
    delete req.query.organization;
    delete req.query.space;
  }
  next();
}
export function checkSSGSecret(req: RequestCustom, res: Response, next: NextFunction) {
  if (req.query.ssg_secret !== process.env.SSG_SECRET) {
    res.status(httpStatus.NOT_FOUND).send(_MSG.RESPONSE.NOT_FOUND(req));
    return;
  }
  next();
}

export function stringifyAdmins(admins: ObjectId[] = []) {
  if (!admins.length) return [];
  return admins.map((admin) => admin.toString());
}

export const ADMIN = 'admin';
export const LOGGED_USER = 'user';
export const SUPER_ADMIN = 'super_admin';
