// import { IUser } from './../../types/model/user.d';
// import { RegisterData } from './../../types/auth/formdata.d';
/** *********** User ************* */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import User from '../../models/User';
// import { UserModel } from 'model/user';
import vars from '../../utils/globalVariables';
import { _MSG } from '../../utils/messages';
import logger from '../../lib/logger';
import { RequestCustom } from '../../types/custom-express/express-custom';
import Space from '../../models/Space';
import Organization from '../../models/Organization';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { userHasSpace } from '../helpers/spaceHelper';
import { resetSpaceCookies, handleSetCookiesFromPayload, JWTPayload } from '../../lib/jwt/jwtUtils';
import { handleGenerateTokenByRoleAtLogin } from '../../utils/login-instance-utils/generateTokens';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import AccessController from '../../models/AccessPermission';
import { roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import { accessPermissionsCache } from '../../lib/mongoose/mongoose-cache/access-permission-cache';
import { correctQueryForEntity } from '../helpers/mongoose.helper';
import { RegisterData } from '../../types/auth/formdata';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-permission-interface';
import { isAdminOfSpace } from '../../middlewares/auth-middlewares';
import UserRegistry from '../../models/UserRegistry';
// import { CurrentSpace } from '../../types/mongoose-types/model-types/space-interface';

const { cookieDomain } = vars;

/**
 * Returns a formatted object with tokens
 * @private
 */
// function generateTokenResponse(user: any, accessToken: string) {
//   const tokenType = 'Bearer';
//   const expiresIn = moment().add(jwtExpirationInterval, 'seconds');
//   return {
//     tokenType,
//     accessToken,
//     expiresIn
//   };
// }

// const TypeofSpaceFromPurpose = {
//   condoAdmin: 'condominium',
//   flatAdmin: 'flat',
//   companyAdmin: 'officeBuilding'
// };

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, password2, name, surname, space, role = 'Inhabitant', isPublic = false } = req.body as RegisterData;

    if (password !== password2) {
      throw new Error('Password non corrispondenti');
    }
    const newUser = new User({
      email,
      password,
      name,
      surname,
      active: true
    });

    const accessToken = newUser.token();

    const newRootSpace = role !== 'Maintainer' && (await createNewSpaceAtRegister({ space, user: newUser }));

    if (role !== 'Maintainer') {
      // create accessPermission for the user and space as system admin
      await AccessController.create({
        role: roleCache.get(role)._id,
        space: newRootSpace._id,
        user: newUser._id
      });
      // create system Admin for the new space and new user
      await AccessController.create({
        space: newRootSpace._id,
        user: newUser._id,
        role: roleCache.get('System Admin')._id
      });
    }
    await newUser.save();

    await UserRegistry.create({ user: newUser, role: roleCache.get(role)._id, isPublic });

    const jwt = JWTPayload.simple({ email: newUser.email, loggedAs: role, ...(newRootSpace ? { spaceId: newRootSpace._id } : {}) });
    handleSetCookiesFromPayload(res, jwt, newRootSpace);

    res.status(httpStatus.CREATED).send({
      success: true,
      message: _MSG.OBJ_CREATED,
      user: newUser,
      accessToken,
      count: 1
    });
  } catch (error) {
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
};
async function createNewSpaceAtRegister({
  space,
  user
}: {
  space: { name: string; address: string; maxUsers: number; password: string };
  user: IUser;
}) {
  try {
    const createdSpace = await Space.create({
      name: space.name,
      address: space.address,
      isHead: true,
      isTail: true,
      isMain: true,
      admins: [user._id],
      maxUsers: space.maxUsers,
      password: space.password
    });
    return createdSpace;
  } catch (error) {
    logger.error(error.message);
    throw new Error(error.message || error);
  }
}

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
const loginByRole = async (req: Request<{ role: RoleFields }>, res: Response) => {
  try {
    const { email, password } = req.body;
    const { role } = req.params as { role: RoleFields };
    // const { user, accessToken: token } = await User.findAndGenerateToken(req.body);
    // const { user, maintainer } = await authLoginInstances({ email, password });
    const user = await User.findOne({ email });
    if (!(await user.passwordMatches(password))) {
      throw new Error('Password non corrispondenti');
    }

    const accessPermissions: AccessPermissionCache[] = await AccessController.find({
      user: user._id
    });

    accessPermissionsCache.set(user._id.toString(), accessPermissions);
    const userRegistry = await UserRegistry.findOne({ user: user._id, role: roleCache.get(role)._id });
    if (!user.isSuperAdmin && !userRegistry) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'User not registered as ' + role
      });
    }
    const payload = await handleGenerateTokenByRoleAtLogin({ selectedRole: role, user });
    //clear all spaceCookies
    resetSpaceCookies(res);

    handleSetCookiesFromPayload(res, payload);
    // res.cookie('jwt', token, sensitiveCookieOptions);
    // res.cookie('loggedAs', role, { ...sensitiveCookieOptions, httpOnly: false, sameSite: false }); // js in browser needs this

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: `login succeeded as ${user.name} ${user.surname} as ${role}`,
        accessLength: accessPermissions.length
      }
    });
    return;
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ ...error, message: error.message || error });
  }
};

const logout = (req: Request, res: Response) => {
  // const domain = cookieDomain;
  // cancello il cookie
  res.clearCookie('jwt', { domain: cookieDomain });
  res.clearCookie('space', { domain: cookieDomain });

  res.clearCookie('spaceName', { domain: cookieDomain });
  // res.clearCookie('maintenance', { domain: cookieDomain });
  // res.clearCookie('maintenanceNonce', { domain: cookieDomain });
  res.clearCookie('organization', { domain: cookieDomain });
  res.status(httpStatus.OK).json({ message: 'Logout effettuato con successo' });
};

const removeSpaceToken = (req: Request, res: Response) => {
  // const domain = cookieDomain;
  // cancello il cookie
  res.clearCookie('space', { domain: cookieDomain });
  res.status(httpStatus.OK).json({ message: 'SpaceToken removed' });
};

type MeUser = {
  _id: string;
  name: string;
  surname: string;
  email: string;
  avatar: string;
  loggedAs: string;
  cover: string;
  isSuperAdmin: boolean;
  isSystemAdmin: boolean;
  phone: string;
  active: boolean;
  accessPermission: AccessPermissionCache;
};

const me = async (req: RequestCustom, res: Response) => {
  // set last login
  try {
    const user = await User.findOne({ _id: req.user._id.toString() });
    user.lastLogin = new Date(Date.now());
    // define transform function here. now only used from me call.
    await user.save();
    const meUser: MeUser = {
      _id: user._id.toString(),
      name: user.name,
      surname: user.surname,
      avatar: user.avatar?.url,
      email: user.email,
      cover: user.cover?.url,
      isSuperAdmin: user.isSuperAdmin,
      loggedAs: req.user.loggedAs.name,
      isSystemAdmin: isAdminOfSpace({
        space: req.user.currentSpace,
        currentUser: req.user
      }),
      phone: user.phone,
      active: user.active,
      accessPermission: req.user.currentAccessController
    };

    return res.send({
      success: true,
      user: meUser,
      loggedAs: req.user.loggedAs
    });
  } catch (error) {
    logger.error(error.message || error);
    res.send('error');
  }
};

export const sendRootSpaceSelectionsToClient = async (req: RequestCustom, res: Response) => {
  try {
    // case user show user.spaces
    //!todo think about structure of the maintainers. do they have to have root spaces? role must be maintainers
    // let query: Record<string, string | any> = { isMain: true, _id: { $in: req.user.spaces } };
    // case admin show all main spaces of his organizations
    const query = req.user.isSuperAdmin
      ? req.query
      : {
          ...req.query,
          _id: {
            $in: accessPermissionsCache.get(req.user._id.toString()).map((actrl) => actrl.space)
          }
        };
    const correctedQuery = correctQueryForEntity({ entity: 'spaces', query });
    const spaces = await Space.find(correctedQuery).populate({ path: 'cover', select: 'url' }).lean();

    res.status(httpStatus.OK).json({
      collection: 'spaces',
      totalDocuments: spaces.length,
      success: true,
      data: spaces
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: _MSG.ERRORS.GENERIC
    });
  }
};

export const sendMainOrganizationSelectionsToClient = async (req: RequestCustom, res: Response) => {
  try {
    // query by users organizations. in all user cases. Since user can have multiple organizations.
    // const query = req.user.isSuperAdmin ? {} : { _id: { $in: req.user.organizations } };
    const organizations = await Organization.find(req.query).lean();
    res.status(httpStatus.OK).json({ success: true, data: organizations });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: _MSG.ERRORS.GENERIC
    });
  }
};

export const setSpaceAndOrgInJwt = async (req: RequestCustom, res: Response) => {
  try {
    const { user } = req;
    if (!user.isSuperAdmin && !userHasSpace(user, req.params.idMongoose)) {
      throw new Error(_MSG.NOT_ALLOWED);
    }
    // user is super admin or has the root space.
    const space = await Space.findById(req.params.idMongoose);
    const payload = new JWTPayload({ loggedAs: req.user.loggedAs.name, email: req.user.email, spaceId: space._id });

    res.clearCookie('jwt', { domain: vars.cookieDomain });
    handleSetCookiesFromPayload(res, payload, space);

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: {
        space: {
          _id: space._id,
          name: space.name,
          address: space.address,
          slug: space.slug,
          image: space.cover?.url
        }
      },
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error
    });
  }
};

export default {
  removeSpaceToken,
  loginByRole,
  logout,
  me,
  register
  // completeRegisterMaintainer
};
