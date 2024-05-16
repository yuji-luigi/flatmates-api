import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { RequestCustom } from '../types/custom-express/express-custom';
import { _MSG } from '../utils/messages';
import { ErrorCustom } from '../lib/ErrorCustom';
import { ReqUser } from '../lib/jwt/jwtTypings';
import { roleCache } from '../lib/mongoose/mongoose-cache/role-cache';
import { RoleName } from '../types/mongoose-types/model-types/role-interface';

export const isLoggedIn = (roles?: RoleName[]) => async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    if (user) {
      if (user.isSuperAdmin) {
        return next();
      }
      if (roles?.length) {
        checkForPermission(roles, user);
      }

      return next();
    }
    throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
  } catch (error) {
    next(error);
  }
};

export function isSuperAdmin(req: RequestCustom, _res: Response, next: NextFunction) {
  if (req.user?.isSuperAdmin) {
    return next();
  } else {
    next(new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED));
  }
}

/** @throws ErrorCustom. check for roles array and user.currentAccessPermission.role */
function checkForPermission(roles: RoleName[], user: ReqUser) {
  if (!user.currentAccessPermission) {
    throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
  }
  const roleIdStrings = roleCache.allRoles.filter((roleC) => roles.includes(roleC.name)).map((roleC) => roleC._id.toString());
  if (roleIdStrings.includes(user.currentAccessPermission?.role.toString())) {
    return;
  }
  throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
}
