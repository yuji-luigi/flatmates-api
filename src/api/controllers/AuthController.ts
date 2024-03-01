import { sensitiveCookieOptions } from '../../utils/globalVariables';
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
import { resetSpaceCookies, handleSetCookiesFromPayload, signLoginInstanceJwt, JWTPayload, signJwt } from '../../lib/jwt/jwtUtils';
import { handleGenerateTokenByRoleAtLogin } from '../../utils/login-instance-utils/generateTokens';
import { RoleFields, roles } from '../../types/mongoose-types/model-types/role-interface';
import AccessController from '../../models/AccessController';
import { roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import { accessControllersCache } from '../../lib/mongoose/mongoose-cache/access-controller-cache';
import { correctQueryForEntity } from '../helpers/mongoose.helper';
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
    const { email, password, password2, name, surname, space } = req.body as RegisterData;

    if (password !== password2) {
      throw new Error('Password non corrispondenti');
    }
    const newUser = new User({
      email,
      password,
      name,
      surname,
      active: true,
      role: 'admin'
    });

    const accessToken = newUser.token();
    // const token = generateTokenResponse(newUser as any, accessToken);

    const newRootSpace = await createNewSpaceAtRegister({ space, user: newUser });
    // create accessController for the user and space as system admin
    await AccessController.create({
      role: roleCache.get(roles[0])._id,
      space: newRootSpace._id,
      user: newUser._id,
      isSystemAdmin: true
    });
    await newUser.save();
    const jwt = JWTPayload.simple({ email: newUser.email, loggedAs: 'Inhabitant', spaceId: newRootSpace._id });
    handleSetCookiesFromPayload(res, jwt, newRootSpace);

    res.status(httpStatus.CREATED).send({
      success: true,
      message: _MSG.OBJ_CREATED,
      user: newUser,
      accessToken,
      count: 1
    });
    // return res.status(httpStatus.OK).redirect('/');
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
};
// const completeRegisterMaintainer = async (req: RequestCustom, res: Response) => {
//   try {
//     const {
//       email,
//       password,
//       password2,
//       name,
//       surname,
//       space: spaceId,
//       organization,
//       _id,
//       maintenanceId,
//       description,
//       tel,
//       address,
//       homepage,
//       company,
//       type
//     } = req.body;

//     if (password !== password2) {
//       throw new Error('Password non corrispondenti');
//     }

//     const authToken = await AuthToken.findOne({
//       'docHolder.ref': 'maintenances',
//       'docHolder.instanceId': maintenanceId,
//       nonce: req.cookies.maintenanceNonce
//     });

//     if (!authToken) throw new Error('invalid access');
//     // find a space for jwt generation
//     const space = await Space.findById(spaceId);
//     const maintainer = await Maintainer.findById(_id);
//     // set all the values passed from the client
//     maintainer.name = name;
//     maintainer.surname = surname;
//     maintainer.email = email;
//     maintainer.password = password;
//     maintainer.active = true;
//     maintainer.description = description;
//     maintainer.tel = tel;
//     maintainer.address = address;
//     maintainer.homepage = homepage;
//     maintainer.company = company;
//     maintainer.type = type;

//     const rootSpaceIds = maintainer.spaces.map((space) => space.toString());
//     maintainer.spaces = [...new Set([...rootSpaceIds, space])];
//     const organizationIds = maintainer.organizations.map((org) => org.toString());
//     maintainer.organizations = [...new Set([...organizationIds, organization])];

//     await maintainer.save();

//     const _leanedMaintainer = maintainer.toObject() as LeanMaintainer;
//     _leanedMaintainer.entity = 'maintainers';
//     _leanedMaintainer.role = 'maintainer';
//     const jwt = generatePayloadMaintainer({ maintainer, space });

//     handleSetCookiesFromPayload(res, jwt);

//     res.status(httpStatus.CREATED).send({
//       success: true,
//       message: _MSG.OBJ_CREATED,
//       user: maintainer,
//       accessToken: jwt,
//       count: 1
//     });
//     // return res.status(httpStatus.OK).redirect('/');
//   } catch (error) {
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
//   }
// };

async function createNewSpaceAtRegister({
  space,
  // purpose,
  user
}: // organization,
// isMain
{
  space: { name: string; address: string; maxUsers: number; password: string };
  // purpose: PurposeUser;
  user: IUser;
  // isMain: boolean;
  // organization: IOrganization | string;
}) {
  try {
    const createdSpace = await Space.create({
      name: space.name,
      address: space.address,
      isHead: true,
      isTail: true,
      isMain: true,
      admins: [user._id],
      maxUsers: space.maxUsers, // this will cost per users or per user/x
      password: space.password
      // organization
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

    const accessControllers = await AccessController.find({
      role: roleCache.get(role)._id,
      user: user._id
    }).lean();

    accessControllersCache.set(user._id.toString(), accessControllers);

    const payload = await handleGenerateTokenByRoleAtLogin({ selectedRole: role, user });
    const token = signLoginInstanceJwt(payload);
    //clear all spaceCookies
    resetSpaceCookies(res);

    res.cookie('jwt', token, sensitiveCookieOptions);
    res.cookie('loggedAs', role, { ...sensitiveCookieOptions, httpOnly: false, sameSite: false }); // js in browser needs this

    res.status(httpStatus.OK).json({
      success: true,
      data: { token, accessControllers, user }
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

const me = async (req: RequestCustom, res: Response) => {
  // set last login
  try {
    const user = await User.findOne({ _id: req.user._id.toString() });
    const accessController = accessControllersCache
      .get(req.user._id.toString())
      .find((actrl) => actrl.space.toString() === req.user.currentSpace._id.toString());
    // define transform function here. now only used from me call.
    user.lastLogin = new Date(Date.now());
    await user.save();
    const meUser = {
      name: user.name,
      surname: user.surname,
      avatar: user.avatar?.url,
      cover: user.cover?.url,
      isSuperAdmin: user.isSuperAdmin,
      phone: user.phone,
      active: user.active,
      accessController
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
            $in: accessControllersCache.get(req.user._id.toString()).map((actrl) => actrl.space)
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
          // organization: space.organization
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
