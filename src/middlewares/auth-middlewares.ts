import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';

import { _MSG } from '../utils/messages';
import { RequestCustom } from '../types/custom-express/express-custom';
import { ObjectId } from 'mongodb';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';
import { ReqUser } from '../lib/jwt/jwtTypings';
import { accessControllersCache } from '../lib/mongoose/mongoose-cache/access-controller-cache';

export function clearQueriesForSAdmin(req: RequestCustom, res: Response, next: NextFunction) {
  if (req.user.isSuperAdmin) {
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

export function stringifyObjectIds(admins: ObjectId[] = []) {
  if (!admins.length) return [];
  return admins.map((admin) => admin.toString());
}

export const ADMIN = 'admin';
export const LOGGED_USER = 'user';
export const SUPER_ADMIN = 'super_admin';

export function checkAdminOfSpace({ space, currentUser }: { space: ISpace; currentUser: ReqUser }) {
  if (currentUser.isSuperAdmin) {
    return true;
  }
  const accessControllers = accessControllersCache.get(currentUser._id.toString());
  const isSystemAdmin = accessControllers.some((actrl) => {
    return actrl.space.toString() === space._id.toString() && (actrl.isSubSystemAdmin || actrl.isSystemAdmin);
  });
  return isSystemAdmin;
}
