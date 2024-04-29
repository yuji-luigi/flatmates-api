// import { IUser } from './../../types/model/user.d';
// import { RegisterData } from './../../types/auth/formdata.d';
/** *********** User ************* */
import { NextFunction, Request, Response } from 'express';
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
import { resetSpaceCookies, handleSetCookiesFromPayload } from '../../lib/jwt/jwtUtils';
import { JWTPayload } from '../../lib/jwt/JwtPayload';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
import { RoleCache, roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import { accessPermissionsCache } from '../../lib/mongoose/mongoose-cache/access-permission-cache';
import { correctQueryForEntity } from '../helpers/mongoose.helper';
import { RegisterData } from '../../types/auth/formdata';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-permission-interface';
import UserRegistry from '../../models/UserRegistry';
import { ErrorCustom } from '../../lib/ErrorCustom';
import { MeUser } from '../../lib/MeUser';
import AuthToken from '../../models/AuthToken';
import Invitation from '../../models/Invitation';
import AccessPermission from '../../models/AccessPermission';

const { cookieDomain } = vars;

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, password2, name, surname, space, role = 'inhabitant', isPublic = false } = req.body as RegisterData;

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

    const newRootSpace = role !== 'maintainer' && (await createNewSpaceAtRegister({ space, user: newUser }));

    if (role !== 'maintainer') {
      // create accessPermission for the user and space as system admin
      await AccessPermission.create({
        role: roleCache.get(role)._id,
        space: newRootSpace._id,
        user: newUser._id
      });
      // create system Admin for the new space and new user
      await AccessPermission.create({
        space: newRootSpace._id,
        user: newUser._id,
        role: roleCache.get('system_admin')._id
      });
    }
    await newUser.save();

    await UserRegistry.create({ user: newUser, role: roleCache.get(role)._id, isPublic });

    const jwt = JWTPayload.simple({
      email: newUser.email,
      loggedAs: role,
      userType: role,
      ...(newRootSpace ? { spaceId: newRootSpace._id } : {})
    });
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
const loginByRole = async (req: Request<{ role: RoleName }>, res: Response) => {
  try {
    const { email, password } = req.body;
    const { role } = req.params as { role: RoleName };

    const user = await User.findOne({ email });
    if (!(await user.passwordMatches(password))) {
      throw new Error('Password non corrispondenti');
    }
    const accessPermissions: AccessPermissionCache[] = await AccessPermission.find({
      user: user._id
    });

    accessPermissionsCache.set(user._id.toString(), accessPermissions);
    const userRegistry = await UserRegistry.findOne({
      user: user._id,
      role: roleCache.get(role)._id
    });
    if (!user.isSuperAdmin && !userRegistry) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'User not registered as ' + role
      });
    }
    const payload = JWTPayload.simple({
      email: user.email,
      loggedAs: role,
      userType: role
    });
    resetSpaceCookies(res);

    handleSetCookiesFromPayload(res, payload);

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: `login succeeded as ${user.name} ${user.surname} as ${role}`,
        accessLength: accessPermissions.length
      }
    });
  } catch (error) {
    logger.error(error.stack || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ ...error, message: error.message || error });
  }
};

const logout = (_req: Request, res: Response) => {
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

const removeSpaceToken = (_req: Request, res: Response) => {
  // const domain = cookieDomain;
  // cancello il cookie
  res.clearCookie('space', { domain: cookieDomain });
  res.status(httpStatus.OK).json({ message: 'SpaceToken removed' });
};

const me = async (req: RequestCustom, res: Response) => {
  // set last login
  try {
    const { user, meUser } = await MeUser.fromReqUserToUserMeUser(req.user);
    user.lastLogin = new Date(Date.now());
    await user.save();

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

export const checkSystemAdmin = async (req: RequestCustom, res: Response) => {
  try {
    const { idMongoose } = req.params;
    const foundSystemAdmin = req.user.accessPermissions.find(
      (actrl) => actrl.space.toString() === idMongoose && actrl.role.toString() === roleCache.get('system_admin')._id.toString()
    );
    if (!foundSystemAdmin) {
      throw new ErrorCustom('You are not system admin of this space', httpStatus.UNAUTHORIZED);
    }

    const payload = new JWTPayload({
      email: req.user.email,
      loggedAs: RoleCache.system_admin.name,
      spaceId: idMongoose,
      userType: req.user.userType.name
    });

    handleSetCookiesFromPayload(res, payload);
    const meUser = await MeUser.fromJwtPayloadUser(payload);
    // const meUser = await MeUser.fromReqUser({ ...req.user, loggedAs: roleCache.get('system_admin') });

    res.status(httpStatus.OK).json({ success: true, data: meUser });
  } catch (error) {
    logger.error(error.stack || error);
    res.status(error.code || 500).json({
      success: false,
      message: error.message || error
    });
  }
};

export const exitSystemAdmin = async (req: RequestCustom, res: Response) => {
  try {
    if (!req.user.userType) {
      throw new ErrorCustom('Authorization problem.', httpStatus.UNAUTHORIZED);
    }
    const userType = roleCache.get(req.user.userType.name);

    // const meUser = await MeUser.fromReqUser({ ...req.user, loggedAs: userType });

    const payload = new JWTPayload({
      email: req.user.email,
      loggedAs: userType.name,
      spaceId: req.user.currentSpace._id,
      userType: req.user.userType.name
    });
    const meUser = await MeUser.fromJwtPayloadUser(payload);
    handleSetCookiesFromPayload(res, payload);
    res.status(httpStatus.OK).json({ success: true, data: meUser });
  } catch (error) {
    logger.error(error.stack || error);
    res.status(error.code || 500).json({
      success: false,
      message: error.message || error
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
    const payload = new JWTPayload({
      loggedAs: req.user.loggedAs.name,
      email: req.user.email,
      spaceId: space._id,
      userType: req.user.userType.name
    });

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

export async function acceptInvitation(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    if (!req.user.email) {
      throw new Error('');
    }
    const authToken = await AuthToken.findOne({ linkId: req.params.linkId });
    if (!authToken) {
      throw new Error('Invalid token');
    }
    const invitation = await Invitation.findOne({
      status: 'pending',
      authToken: authToken._id,
      email: req.user.email
    });
    if (!invitation) {
      throw new Error('Invalid invitation');
    }
    invitation.status = 'accepted';
    await invitation.save();

    const newAccessPermission = new AccessPermission({
      user: req.user._id,
      role: RoleCache[invitation.userType],
      space: invitation.space
    });
    await UserRegistry.create({ user: req.user, role: RoleCache[invitation.userType], isPublic: false }).catch(console.error);
    await newAccessPermission.save();

    await AuthToken.deleteOne({ _id: authToken._id });

    const payload = new JWTPayload({
      email: req.user.email,
      loggedAs: invitation.userType,
      userType: invitation.userType,
      spaceId: invitation.space
    });

    handleSetCookiesFromPayload(res, payload);

    res.status(httpStatus.OK).json({});
  } catch (error) {
    logger.error(error.stack || error);
    next(error);
  }
}

export async function getInvitationByLinkId(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    const [invitation] = await AuthToken.aggregate([
      {
        $match: {
          linkId: req.params.linkId
        }
      },
      {
        $lookup: {
          from: 'invitations',
          localField: '_id',
          foreignField: 'authToken',
          as: 'invitation',
          pipeline: [
            {
              $match: {
                status: 'pending'
              }
            },
            {
              $lookup: {
                from: 'spaces',
                localField: 'space',
                foreignField: '_id',
                as: 'space'
              }
            },
            { $unwind: '$space' }
          ]
        }
      },
      {
        $unwind: { path: '$invitation', preserveNullAndEmptyArrays: true }
      },
      {
        $replaceRoot: { newRoot: '$invitation' }
      },
      {
        $project: {
          _id: 1,
          space: {
            name: 1,
            _id: 1
          }
        }
      }
    ]);
    res.status(httpStatus.OK).json({ success: true, data: invitation });
  } catch (error) {
    logger.error(error.stack || error);
    next(error);
  }
}

export default {
  removeSpaceToken,
  loginByRole,
  logout,
  acceptInvitation,
  me,
  register,
  getInvitationByLinkId
  // completeRegisterMaintainer
};
