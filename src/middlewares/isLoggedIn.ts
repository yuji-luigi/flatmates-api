import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { RequestCustom } from '../types/custom-express/express-custom';
import { _MSG } from '../utils/messages';
import { ErrorCustom } from '../lib/ErrorCustom';
import { ReqUser } from '../lib/jwt/jwtTypings';
import { roleCache } from '../lib/mongoose/mongoose-cache/role-cache';
import { RoleName } from '../types/mongoose-types/model-types/role-interface';
import Space from '../models/Space';

export const isLoggedIn = (roles?: RoleName[]) => async (req: RequestCustom, _res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    if (user) {
      if (user.isSuperAdmin) {
        return next();
      }
      if (roles?.length) {
        const spaceId = user.currentSpace?._id?.toString(); /* || req.params.spaceId || req.params.idMongoose || req.params.parentId; */
        await checkForPermission(roles, user, spaceId);
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
async function checkForPermission(roles: RoleName[], user: ReqUser, spaceId: string | undefined | null) {
  if (!spaceId) {
    throw new ErrorCustom(_MSG.ERRORS.INTERNAL_SERVER_ERROR, httpStatus.INTERNAL_SERVER_ERROR, 'SpaceId is not defined somehow... This is a bug.');
  }
  if (!user.currentAccessPermission) {
    throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
  }
  // roleCache.allRoles returns all roles in the system. role should be renamed to userType
  const roleIds = roleCache.allRoles.filter((role) => roles.includes(role.name)).map((role) => role._id.toString());
  if (!roleIds.includes(user.currentAccessPermission?.role.toString())) {
    throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED, 'access failed for role filtering.');
  }
  // TODO: CHECK IF THIS WOKS  WITH POSTMAN OR OTHER CLIENTS.
  const space = await Space.findById(spaceId);
  if (!space) {
    throw new ErrorCustom(_MSG.ERRORS.INTERNAL_SERVER_ERROR, httpStatus.INTERNAL_SERVER_ERROR, 'Space not found');
  }
  const allAncestorAndSelf = [...space.parentIds, spaceId];
  // case user passed the permission control
  if (user.currentAccessPermission && allAncestorAndSelf.includes(user.currentAccessPermission.space.toString())) {
    return;
  }
  throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
}
