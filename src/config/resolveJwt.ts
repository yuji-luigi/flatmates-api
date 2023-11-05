import passport from 'passport-jwt';
import { Request } from 'express';
import vars from './vars';
import User from '../models/User';
import Space from '../models/Space';
import { LeanUser } from '../types/mongoose-types/model-types/user-interface';
import { ObjectId } from 'bson';
import { stringifyObjectIds } from '../middlewares/auth-middlewares';

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

export type JwtReturnType = LeanUser & {
  spaceName?: string;
  spaceId?: ObjectId;
  organizationId?: ObjectId;
  /** check from selected space.admins and requesting user id */
  isAdminOfSpace: boolean;
  spaceAdmins: ObjectId[] | [];
};
// now payload must have entity string
const jwt = async (payload: any, done: any) => {
  try {
    // const user = await User.findOne({ email: payload.email }).lean();
    // if (user) return done(null, user);
    // return done(null, false);
    const user: LeanUser = await User.findOne({ email: payload.email }).lean();
    if (payload.entity === 'maintainer') {
      // const maintainer = await Maintainer.findOne({ email: payload.email }).lean();
    }
    const result: JwtReturnType = { ...user, spaceAdmins: [], isAdminOfSpace: false };
    if (!user) {
      return done(null, false);
    }
    // Fetch space and organization if they're in the payload

    if (payload.spaceId) {
      // get selected space(space organization input)
      const space = await Space.findById(payload.spaceId).lean();
      result.spaceName = space.name;
      result.spaceId = space._id;
      result.spaceAdmins = space.admins;
      // from selectedSpace extract admins Array then check the requiesting user is in the array.
      // if yes then set the user is admin of the space
      result.isAdminOfSpace = stringifyObjectIds(space.admins).includes(user._id.toString());
    }
    if (payload.organizationId) {
      // const organization = await Organization.findById(payload.organizationId).lean();
      result.organizationId = new ObjectId(payload.organizationId);
    }
    // You can attach space and organization to the user object if you like

    return done(null, result);
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
  jwt: new JwtStrategy(jwtOptions, jwt)
  // handleSpaceJwt: new JwtStrategy(spaceJwtOptions, handleSpaceJwt),
  // handleOrganizationJwt: new JwtStrategy(organizationJwtOptions, handleOrganizationJwt)
  // handleQueryJwt: new JwtStrategy(queryJwtOptions, handleQueryJwt)
};
