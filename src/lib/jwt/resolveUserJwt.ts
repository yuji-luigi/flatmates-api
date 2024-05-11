import passport from 'passport-jwt';
import { Request } from 'express';
import vars from '../../utils/globalVariables';
import User from '../../models/User';
import Space from '../../models/Space';
import { isAdminOfSpace } from '../../middlewares/auth-middlewares';
import { reqUserBuilder } from './reqUserBuilder';
import { CurrentSpace, JwtSignPayload, JwtSignPayloadWithAccessCtrlAndSpaceDetail, ReqUser } from './jwtTypings';
import { accessPermissionsCache } from '../mongoose/mongoose-cache/access-permission-cache';
import AccessController from '../../models/AccessPermission';
import logger from '../logger';
import { spaceCache } from '../mongoose/mongoose-cache/space-cache';
import { UserResolverReturnType } from '../../middlewares/handleUserFromRequest';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-permission-interface';

const { jwtSecret } = vars;
const JwtStrategy = passport.Strategy;
// Frontend will send the token in the authorization header.
function extractToken(req: Request) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}
// function extractTokenEx(req: Request, headerKey: string) {
//   return req.headers[headerKey] || '';
// }

/** NEW COOKIE HTTPONLY * */
const cookieExtractor = (req: Request) => {
  let jwt = null;

  if (req && req.cookies) {
    jwt = req.cookies.jwt;
  }

  return jwt || extractToken(req);
};

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: cookieExtractor
};

const resolveUserJwt = async (resolvedJwt: JwtSignPayload | JwtSignPayloadWithAccessCtrlAndSpaceDetail, done: UserResolverReturnType) => {
  try {
    const leanUser: ReqUser = await User.findOne({ email: resolvedJwt.email }).lean();
    delete leanUser.password;
    if (!leanUser) {
      return done(null, false);
    }
    // init cache of all accessPermissions of the user. setting array of accessPermissions in the cache
    // TODO: good logic for init space cache. where when how which space.
    if (!accessPermissionsCache.get(leanUser._id.toString())) {
      const _accessControllers: AccessPermissionCache[] = await AccessController.find({
        user: leanUser._id
      });
      accessPermissionsCache.set(leanUser._id.toString(), _accessControllers);
    }

    const accessPermissions = accessPermissionsCache.get(leanUser._id.toString()) || [];

    for (const aCtrl of accessPermissions) {
      // init cache of all spaces of the user(accessPermissions).
      // todo: the use case of the cache??
      if (!spaceCache.getWithoutException(aCtrl.space.toString())) {
        const space = await Space.findById(aCtrl.space).lean();
        spaceCache.set(aCtrl.space.toString(), space);
      }
    }

    const currentSpace: CurrentSpace = {
      isAdminOfSpace: false
    };
    // case space field in jwt and also is truthy. prepare set space info in req.user
    if ('spaceId' in resolvedJwt && resolvedJwt.spaceId) {
      if (accessPermissions.length && !accessPermissions.map((aCtrl) => aCtrl.space.toString()).includes(resolvedJwt.spaceId)) {
        return done(null, false);
      }

      const space = spaceCache.getWithoutException(resolvedJwt.spaceId);
      if (space) {
        currentSpace.name = space.name;
        currentSpace._id = space._id;
      }
      leanUser.isAdminOfCurrentSpace = isAdminOfSpace({ space, currentUser: leanUser });
    }

    const currentAccessPermission = accessPermissions.find((aCtrl) => aCtrl.space.toString() === currentSpace._id?.toString());

    const reqUser = reqUserBuilder({
      user: leanUser,
      currentSpace,
      loggedAs: resolvedJwt.loggedAs,
      userType: resolvedJwt.userType,
      accessPermissions,
      currentAccessPermission
    });

    return done(null, reqUser);
  } catch (error) {
    logger.error(error.stack || error);
    return done(error, false); // todo: find out why user parameter is undefined in handleUserFromRequest function after this
  }
};

export default {
  jwt: new JwtStrategy(jwtOptions, resolveUserJwt)
};
