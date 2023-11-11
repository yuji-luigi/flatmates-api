import passport from 'passport-jwt';
import { Request } from 'express';
import vars from './vars';
import User from '../models/User';
import Space from '../models/Space';
import { LeanUser } from '../types/mongoose-types/model-types/user-interface';
import { ObjectId } from 'bson';
import { stringifyObjectIds } from '../middlewares/auth-middlewares';
import { LeanMaintainer } from '../types/mongoose-types/model-types/maintainer-interface';
import Maintainer from '../models/Maintainer';

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

export type JwtReturnType = (LeanUser | (LeanMaintainer & { role: 'maintainer' })) & JwtReturnSpaceType;

export type JwtReturnSpaceType = {
  spaceName?: string;
  spaceId?: ObjectId;
  organizationId?: ObjectId;
  entity?: 'users' | 'maintainers';
  /** check from selected space.admins and requesting user id */
  isAdminOfSpace: boolean;
  spaceAdmins: ObjectId[] | [];
};
// now payload must have entity string
type JwtPayload = {
  email: string;
  organizationId: string;
  spaceId?: string;
  entity: 'users' | 'maintainers';
};
const jwt = async (payload: JwtPayload, done: any) => {
  try {
    // const user = await User.findOne({ email: payload.email }).lean();
    // if (user) return done(null, user);
    // return done(null, false);

    const leanLoginInstance: LeanMaintainer | LeanUser = await geLeanLoginInstance(payload);
    if (!leanLoginInstance) {
      return done(null, false);
    }

    // Fetch space and organization if they're in the payload
    const jwtSpaceReturnObject: JwtReturnSpaceType = {
      isAdminOfSpace: false,
      spaceAdmins: []
    };
    if (leanLoginInstance && payload.spaceId) {
      // get selected space(space organization input)
      const space = await Space.findById(payload.spaceId).lean();
      jwtSpaceReturnObject.spaceName = space.name;
      jwtSpaceReturnObject.spaceId = space._id;
      jwtSpaceReturnObject.spaceAdmins = space.admins;
      // from selectedSpace extract admins Array then check the requiesting user is in the array.
      // if yes then set the user is admin of the space
      jwtSpaceReturnObject.isAdminOfSpace = stringifyObjectIds(space.admins).includes(leanLoginInstance._id.toString());
    }
    if (payload.organizationId) {
      // const organization = await Organization.findById(payload.organizationId).lean();
      jwtSpaceReturnObject.organizationId = new ObjectId(payload.organizationId);
    }
    const result = createJwtReturnObject(leanLoginInstance, jwtSpaceReturnObject);

    // You can attach space and organization to the user object if you like
    return done(null, result);
  } catch (error) {
    return done(error, false);
  }
};

/**
 * @description if incoming jwt payload is maintainer then set role as maintainer.
 * always set entity as users or maintainers
 */
async function geLeanLoginInstance(payload: JwtPayload): Promise<LeanUser | LeanMaintainer> {
  let result: LeanUser | LeanMaintainer;
  if (payload.entity === 'users') {
    const user = (await User.findOne({ email: payload.email }).lean()) as LeanUser;
    result = { ...user, entity: 'users' };
  }
  if (payload.entity === 'maintainers') {
    const maintainer = await Maintainer.findOne({ email: payload.email }).lean();
    result = { ...maintainer, entity: 'maintainers', role: 'maintainer' };
  }

  return result;
}

const createJwtReturnObject = (leanInstance: LeanUser | LeanMaintainer, jwtSpaceReturnObject: JwtReturnSpaceType): JwtReturnType => {
  // Here TypeScript will infer the correct type based on the entity discriminator
  if (leanInstance.entity === 'maintainers') {
    const jwtReturnObject: JwtReturnType = {
      ...leanInstance,
      ...jwtSpaceReturnObject,
      entity: 'maintainers'
    };
    return jwtReturnObject;
  }
  if (leanInstance.entity === 'users') {
    const jwtReturnObject: JwtReturnType = {
      ...leanInstance,
      ...jwtSpaceReturnObject,
      entity: 'users'
    };
    return jwtReturnObject;
  }
  throw new Error('createJwtReturnObject: entity is not defined');
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
