import passport from 'passport-jwt';
import { Request } from 'express';
import vars from '../../utils/globalVariables';
import User from '../../models/User';
import Space from '../../models/Space';
import { checkAdminOfSpace } from '../../middlewares/auth-middlewares';
import { reqUserBuilder } from './reqUserBuilder';
import { CurrentSpace, JwtSignPayload, JwtSignPayloadWithAccessCtrlAndSpaceDetail, ReqUser } from './jwtTypings';
import { accessControllersCache } from '../mongoose/mongoose-cache/access-controller-cache';
import AccessController from '../../models/AccessController';
import logger from '../logger';
import { spaceCache } from '../mongoose/mongoose-cache/space-cache';
import { UserResolverReturnType } from '../../middlewares/handleUserFromRequest';
import { AccessControllerCache } from '../../types/mongoose-types/model-types/access-controller-interface';

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

/** created for other than user auth cookie  * */
// const cookieExtractorEx = (req: Request) => {
//   return (headerKey: string) => {
//     return req.cookies[headerKey] || req.headers[headerKey] || '';
//   };
// };

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: cookieExtractor
  // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
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
    if (!accessControllersCache.get(leanUser._id.toString())) {
      const _accessControllers: AccessControllerCache[] = await AccessController.find({
        user: leanUser._id
      });
      accessControllersCache.set(leanUser._id.toString(), _accessControllers);
    }

    const accessPermissions = accessControllersCache.get(leanUser._id.toString());

    for (const aCtrl of accessPermissions) {
      // init cache of all spaces of the user(accessPermissions).
      // todo: the use case of the cache??
      if (!spaceCache.get(aCtrl.space.toString())) {
        const space = await Space.findById(aCtrl.space).lean();
        spaceCache.set(aCtrl.space.toString(), space);
      }
    }

    //Todo: set SpaceId[] in req.user and use it for querying. when selected one space from frontend (AppBar) then only one space array.
    //! Actually use directly the accessPermissions array for querying.
    // Fetch space and organization if they're in the resolvedJwt
    const currentSpace: CurrentSpace = {
      isAdminOfSpace: false
    };
    // if spaceId key in resolvedJwt
    if ('spaceId' in resolvedJwt) {
      if (accessPermissions.length && !accessPermissions.map((aCtrl) => aCtrl.space.toString()).includes(resolvedJwt.spaceId)) {
        return done(null, false);
      }
      // get selected space(space organization input)
      // const space = await Space.findById(resolvedJwt.spaceId).lean();
      const space = spaceCache.get(resolvedJwt.spaceId);
      currentSpace.name = space.name;
      currentSpace._id = space._id;
      // from selectedSpace extract admins Array then check the requiesting user is in the array.
      // if yes then set the user is admin of the space
      leanUser.isAdminOfCurrentSpace = checkAdminOfSpace({ space, currentUser: leanUser });
    }

    const currentAccessController =
      accessPermissions.length && accessPermissions.find((aCtrl) => aCtrl.space.toString() === currentSpace._id?.toString());

    const reqUser = await reqUserBuilder({
      user: leanUser,
      currentSpace,
      loggedAs: resolvedJwt.loggedAs,
      accessPermissions,
      currentAccessController
    });

    // You can attach space and organization to the user object if you like
    return done(null, reqUser);
  } catch (error) {
    logger.error(error.message || error);
    return done(error, null); // todo: find out why user parameter is undefined in handleUserFromRequest function after this
  }
};

export default {
  jwt: new JwtStrategy(jwtOptions, resolveUserJwt)
};
