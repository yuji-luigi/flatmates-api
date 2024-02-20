import passport from 'passport-jwt';
import { Request } from 'express';
import vars from '../../utils/globalVariables';
import User from '../../models/User';
import Space from '../../models/Space';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { stringifyObjectIds } from '../../middlewares/auth-middlewares';
import { reqUserBuilder } from './reqUserBuilder';
import { CurrentSpace, DecodedJwtPayload, ReqUser } from './jwtTypings';
import { accessControllersCache } from '../mongoose/mongoose-cache/access-controller-cache';
import { roleCache } from '../mongoose/mongoose-cache/role-cache';
import AccessController from '../../models/AccessController';
import logger from '../logger';
import { spaceCache } from '../mongoose/mongoose-cache/space-cache';
import { UserResolverReturnType } from '../../middlewares/handleUserFromRequest';

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

const resolveUserJwt = async (payload: DecodedJwtPayload, done: UserResolverReturnType) => {
  try {
    const leanUser: UserBase = await User.findOne({ email: payload.email }).lean();
    delete leanUser.password;
    if (!leanUser) {
      return done(null, false);
    }

    if (!accessControllersCache.get(leanUser._id.toString())) {
      const _accessControllers = await AccessController.find({ user: leanUser._id, role: roleCache.get(payload.loggedAs) });
      accessControllersCache.set(leanUser._id.toString(), _accessControllers);
    }

    const accessControllers = accessControllersCache.get(leanUser._id.toString());

    for (const aCtrl of accessControllers) {
      if (!spaceCache.get(aCtrl.space.toString())) {
        const space = await Space.findById(aCtrl.space).lean();
        spaceCache.set(aCtrl.space.toString(), space);
      }
    }

    //Todo: set SpaceId[] in req.user and use it for querying. when selected one space from frontend (AppBar) then only one space array.
    //! Actually use directly the accessControllers array for querying.
    // Fetch space and organization if they're in the payload
    const currentSpace: CurrentSpace = {
      isAdminOfSpace: false
    };
    // if spaceId key in payload
    if ('spaceId' in payload) {
      // get selected space(space organization input)
      const space = await Space.findById(payload.spaceId).lean();
      currentSpace.spaceName = space.name;
      currentSpace.spaceId = space._id;
      // from selectedSpace extract admins Array then check the requiesting user is in the array.
      // if yes then set the user is admin of the space
      currentSpace.isAdminOfSpace = stringifyObjectIds(space.admins).includes(leanUser._id.toString());
    }

    const reqUser = await reqUserBuilder({ user: leanUser, currentSpace, loggedAs: payload.loggedAs, accessControllers });

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
