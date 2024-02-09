import passport from 'passport-jwt';
import { Request } from 'express';
import vars from '../../utils/globalVariables';
import User from '../../models/User';
import Space from '../../models/Space';
import { LeanUser } from '../../types/mongoose-types/model-types/user-interface';
import { ObjectId } from 'bson';
import { stringifyObjectIds } from '../../middlewares/auth-middlewares';
import { reqUserBuilder } from './reqUserBuilder';
import { CurrentSpace, DecodedJwtPayload, ReqUser } from './jwtTypings';

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

type UserResolverReturnType = (err: any, user: ReqUser | boolean, info?: any) => void;

const resolveUserJwt = async (payload: DecodedJwtPayload, done: UserResolverReturnType) => {
  try {
    const leanUser: LeanUser = await User.findOne({ email: payload.email }).lean();
    delete leanUser.password;
    if (!leanUser) {
      return done(null, false);
    }

    // Fetch space and organization if they're in the payload
    const currentSpace: CurrentSpace = {
      isAdminOfSpace: false,
      spaceAdmins: []
    };
    // if spaceId key in payload
    if ('spaceId' in payload) {
      // get selected space(space organization input)
      const space = await Space.findById(payload.spaceId).lean();
      currentSpace.spaceName = space.name;
      currentSpace.spaceId = space._id;
      currentSpace.spaceAdmins = space.admins;
      // from selectedSpace extract admins Array then check the requiesting user is in the array.
      // if yes then set the user is admin of the space
      currentSpace.isAdminOfSpace = stringifyObjectIds(space.admins).includes(leanUser._id.toString());
    }
    if (payload.organizationId) {
      // set sected organization id in to currentSpace data
      currentSpace.organizationId = new ObjectId(payload.organizationId);
    }
    const reqUser = await reqUserBuilder(leanUser, currentSpace, payload.loggedAs);

    // You can attach space and organization to the user object if you like
    return done(null, reqUser);
  } catch (error) {
    return done(error, false);
  }
};

// const handleSpaceJwt = async (payload: any, done: any) => {
//   try {
//     // const user = await User.findById(payload.id);
//     const space = await Space.findById(payload._id).lean();
//     // .populate({ path: 'organization', select: 'name' });
//     if (space) return done(null, space);
//     return done(null, false);
//   } catch (error) {
//     return done(error, false);
//   }
// };

// const handleOrganizationJwt = async (payload: any, done: any) => {
//   try {
//     // const user = await User.findById(payload.id);
//     const organization = await Organization.findById(payload).lean();
//     // .populate({ path: 'organization', select: 'name' });
//     if (organization) return done(null, organization);
//     return done(null, false);
//   } catch (error) {
//     return done(error, false);
//   }
// };

// const spaceJwtOptions = {
//   secretOrKey: jwtSecret,
//   jwtFromRequest: (req: Request) => cookieExtractorEx(req)('space')
// };
// const organizationJwtOptions = {
//   secretOrKey: jwtSecret,
//   jwtFromRequest: (req: Request) => cookieExtractorEx(req)('organization')
// };

// const queryJwtOptions = {
//   secretOrKey: jwtSecret,
//   jwtFromRequest: (req: Request) => spaceOrgCookieExtractor(req)
// };
// /** created for other than user auth cookie  * */
// const spaceOrgCookieExtractor = (req: Request) => {
//   const space = req.cookies['space'] || req.headers['space'];
//   const organization = req.cookies['organization'] || req.headers['organization'];
//   const cookies: { space: ISpace | null; organization: string | null } = {
//     space,
//     organization
//   };
//   return cookies;
// }
// async function handleQueryJwt(payload, done) {
// return done(null, payload);
// }

export default {
  jwt: new JwtStrategy(jwtOptions, resolveUserJwt)
  // handleSpaceJwt: new JwtStrategy(spaceJwtOptions, handleSpaceJwt),
  // handleOrganizationJwt: new JwtStrategy(organizationJwtOptions, handleOrganizationJwt)
  // handleQueryJwt: new JwtStrategy(queryJwtOptions, handleQueryJwt)
};
