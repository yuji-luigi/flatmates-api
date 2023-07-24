import passport from 'passport-jwt';
import { Request } from 'express';
import vars from './vars';
import User from '../models/User';
import Space from '../models/Space';
// import Maintenance from '../models/Maintenance';

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
const cookieExtractorEx = (req: Request) => {
  return (headerKey: string) => {
    return req.cookies[headerKey] || req.headers[headerKey] || '';
  };
};

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: cookieExtractor
  // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const jwt = async (payload: any, done: any) => {
  try {
    // const user = await User.findById(payload.id);
    const user = await User.findOne({ email: payload.email }).lean();
    // .populate({ path: 'organization', select: 'name' });
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

const handleSpaceJwt = async (payload: any, done: any) => {
  try {
    // const user = await User.findById(payload.id);
    const space = await Space.findById(payload._id).lean();
    // .populate({ path: 'organization', select: 'name' });
    if (space) return done(null, space);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

// const handleMaintenanceJwt = async (payload: any, done: any) => {
//   try {
//     // const user = await User.findById(payload.id);
//     const maintenance = await Maintenance.findById(payload._id)
//       .populate({ path: 'mainSpace', select: 'name' })
//       .populate({ path: 'organization', select: 'name' })
//       .populate({ path: 'maintainer', select: 'name' });
//     // .populate({ path: 'organization', select: 'name' });
//     if (maintenance) return done(null, maintenance);
//     return done(null, false);
//   } catch (error) {
//     return done(error, false);
//   }
// };

const spaceJwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: (req: Request) => cookieExtractorEx(req)('space')
};
// const maintenanceJwtOptions = {
//   secretOrKey: jwtSecret,
//   jwtFromRequest: (req: Request) => cookieExtractorEx(req)('maintenance')
// };

export default {
  jwt: new JwtStrategy(jwtOptions, jwt),
  handleSpaceJwt: new JwtStrategy(spaceJwtOptions, handleSpaceJwt)
  // handleMaintenanceJwt: new JwtStrategy(maintenanceJwtOptions, handleMaintenanceJwt)
};
