import { sensitiveCookieOptions } from './../../config/vars';
// import { IUser } from './../../types/model/user.d';
// import { RegisterData } from './../../types/auth/formdata.d';
/** *********** User ************* */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import User from '../../models/User';
// import { UserModel } from 'model/user';
import vars from '../../config/vars';
import { _MSG } from '../../utils/messages';
import logger from '../../config/logger';
import { RequestCustom } from '../../types/custom-express/express-custom';
import Space from '../../models/Space';
import Organization from '../../models/Organization';
import { IOrganization } from '../../types/mongoose-types/model-types/organization-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { userHasSpace } from '../helpers/spaceHelper';
import { createJWTObjectFromJWTAndSpace, resetSpaceCookies, handleSetCookiesFromPayload, signLoginInstanceJwt } from '../../lib/jwt/jwtUtils';
import Maintainer from '../../models/Maintainer';
import { generatePayloadMaintainer, handleGenerateToken, handleGenerateTokenByRole } from '../../utils/login-instance-utils/generateTokens';
import { LeanMaintainer } from '../../types/mongoose-types/model-types/maintainer-interface';
import AuthToken from '../../models/AuthToken';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { ObjectId } from 'mongodb';
import { isValidLogin } from '../helpers/authHelper';
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

    // IF YOU WANT TO CREATE SOME OTHER ENTITY WITH NEW USER. CODE HERE
    // const {data, message} = await crudHelper.createWithReturnValue('projects', {
    //     name: project,
    //     email_sender: email,
    // });

    // Created user must have the User field and methods such as token()
    const newUser = new User({
      email,
      password,
      name,
      surname,
      active: true,
      role: 'admin'
    }) as any;

    const newOrganization = new Organization({
      name: `${name} ${surname}'s organization`
    });

    const accessToken = newUser.token();
    // const token = generateTokenResponse(newUser as any, accessToken);

    const newRootSpace = await createNewSpaceAtRegister({ space, user: newUser, organization: newOrganization, isMain: true });
    // const spaceCookie = formatCurrentSpaceToJSON(newRootSpace);
    await newOrganization.save();

    newUser.rootSpaces.push(newRootSpace);
    newUser.organizations.push(newOrganization);
    await newUser.save();

    const _leanedUser = newUser.toObject();
    _leanedUser.entity = 'users';
    const jwt = createJWTObjectFromJWTAndSpace({ user: _leanedUser, space: newRootSpace });
    handleSetCookiesFromPayload(res, jwt);
    // res.cookie('organization', organizationToken, sensitiveCookieOptions);
    // res.cookie('space', spaceCookie, sensitiveCookieOptions);
    // res.cookie('jwt', token.accessToken, sensitiveCookieOptions);

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
const completeRegisterMaintainer = async (req: RequestCustom, res: Response) => {
  try {
    const {
      email,
      password,
      password2,
      name,
      surname,
      rootSpace,
      organization,
      _id,
      maintenanceId,
      description,
      tel,
      address,
      homepage,
      company,
      type
    } = req.body;

    if (password !== password2) {
      throw new Error('Password non corrispondenti');
    }

    const authToken = await AuthToken.findOne({
      'docHolder.ref': 'maintenances',
      'docHolder.instanceId': maintenanceId,
      nonce: req.cookies.maintenanceNonce
    });

    if (!authToken) throw new Error('invalid access');
    // find a space for jwt generation
    const space = await Space.findById(rootSpace);
    const maintainer = await Maintainer.findById(_id);
    // set all the values passed from the client
    maintainer.name = name;
    maintainer.surname = surname;
    maintainer.email = email;
    maintainer.password = password;
    maintainer.active = true;
    maintainer.description = description;
    maintainer.tel = tel;
    maintainer.address = address;
    maintainer.homepage = homepage;
    maintainer.company = company;
    maintainer.type = type;

    const rootSpaceIds = maintainer.rootSpaces.map((space) => space.toString());
    maintainer.rootSpaces = [...new Set([...rootSpaceIds, rootSpace])];
    const organizationIds = maintainer.organizations.map((org) => org.toString());
    maintainer.organizations = [...new Set([...organizationIds, organization])];

    await maintainer.save();

    const _leanedMaintainer = maintainer.toObject() as LeanMaintainer;
    _leanedMaintainer.entity = 'maintainers';
    _leanedMaintainer.role = 'maintainer';
    const jwt = generatePayloadMaintainer({ maintainer, space });

    handleSetCookiesFromPayload(res, jwt);

    res.status(httpStatus.CREATED).send({
      success: true,
      message: _MSG.OBJ_CREATED,
      user: maintainer,
      accessToken: jwt,
      count: 1
    });
    // return res.status(httpStatus.OK).redirect('/');
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
};

async function createNewSpaceAtRegister({
  space,
  // purpose,
  user,
  organization,
  isMain
}: {
  space: { name: string; address: string; maxUsers: number; password: string };
  // purpose: PurposeUser;
  user: IUser;
  isMain: boolean;
  organization: IOrganization | string;
}) {
  try {
    const createdSpace = await Space.create({
      name: space.name,
      address: space.address,
      isHead: true,
      isTail: true,
      isMain,
      admins: [user._id],
      maxUsers: space.maxUsers, // this will cost per users or per user/x
      password: space.password,
      organization
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
const login = async (req: Request<{ role: RoleFields }>, res: Response) => {
  try {
    const { email, password } = req.body;
    // const { user, accessToken: token } = await User.findAndGenerateToken(req.body);
    // const { user, maintainer } = await authLoginInstances({ email, password });
    const user = await User.findOne({ email }).populate({
      path: 'role',
      populate: [{ path: 'maintainer.profile' }, { path: 'administrator.profile' }]
    });
    if (!(await user.passwordMatches(password))) {
      throw new Error('Password non corrispondenti');
    }

    // if (user && maintainer) {
    //   return res.status(httpStatus.OK).json({
    //     success: false,
    //     data: {
    //       user,
    //       maintainer
    //     },
    //     message: 'Decide in which entity you want to login'
    //   });
    // }

    const payload = handleGenerateToken({ user });
    const token = signLoginInstanceJwt(payload);
    //clear all spaceCookies
    resetSpaceCookies(res);

    res.cookie('jwt', token, sensitiveCookieOptions);
    return res.send({
      success: true,
      data: { token }
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ ...error, message: error.message || error });
  }
};
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
    const user = await User.findOne({ email }).populate({
      path: 'role',
      populate: [{ path: 'maintainer.profile' }, { path: 'administrator.profile' }]
    });
    if (!(await user.passwordMatches(password))) {
      throw new Error('Password non corrispondenti');
    }
    if (user.role instanceof ObjectId) {
      return;
    }
    const userRoleField = user.role?.[role];

    if (!user.role.isSuperAdmin && !userRoleField.hasAccess) {
      throw new Error('You have no access to this entity');
    }

    if (!isValidLogin({ role: user.role, loggedAs: role })) {
      throw new Error('You do not have access to this role. Please contact the administrator');
    }
    const payload = await handleGenerateTokenByRole({ selectedRole: role, user });
    const token = signLoginInstanceJwt(payload);
    //clear all spaceCookies
    resetSpaceCookies(res);

    res.cookie('jwt', token, sensitiveCookieOptions);
    res.cookie('loggedAs', role, { ...sensitiveCookieOptions, httpOnly: false, sameSite: false });

    res.send({
      success: true,
      data: { token }
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
    user.lastLogin = new Date(Date.now());
    await user.save();
    await user.populate('role');

    return res.send({
      success: true,
      user,
      loggedAs: req.user.loggedAs
    });
  } catch (error) {
    logger.error(error.message || error);
    res.send('error');
  }
};

export const sendMainSpaceSelectionsToClient = async (req: RequestCustom, res: Response) => {
  try {
    // case user show user.rootSpaces
    //!todo think about structure of the maintainers. do they have to have root spaces? role must be maintainers
    let query: Record<string, string | any> = { isMain: true, _id: { $in: req.user.rootSpaces } };
    // let mainSpaces = await Space.find({ isMain: true, _id: { $in: req.user.rootSpaces } });
    // case admin show all main spaces of his organizations
    if (req.user.loggedAs === 'administrator') {
      query = { isMain: true, organization: { $in: req.user.organizations } };
    }
    if (req.user.isSuperAdmin) {
      query = { isMain: true, organization: req.user.organizationId };
      // mainSpaces = await Space.find({ isMain: true, organization: req.user.organizationId });
    }

    const mainSpaces = await Space.find(query).populate({ path: 'cover', select: 'url' }).lean();

    res.status(httpStatus.OK).json({
      collection: 'spaces',
      totalDocuments: mainSpaces.length,
      success: true,
      data: mainSpaces
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
    const query = req.user.isSuperAdmin ? {} : { _id: { $in: req.user.organizations } };
    const organizations = await Organization.find(query).lean();
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
    // const user = await User.findById(req.user._id);
    // set new property to resolved jwt(.)
    if (!user.isSuperAdmin && !userHasSpace(user, req.params.idMongoose)) {
      throw new Error(_MSG.NOT_ALLOWED);
    }
    // user is super admin or has the root space.
    const space = await Space.findById(req.params.idMongoose);
    const jwt = createJWTObjectFromJWTAndSpace({ user: req.user, space });
    // const jwt = signJwt(updatedJwt);

    res.clearCookie('jwt', { domain: vars.cookieDomain });
    handleSetCookiesFromPayload(res, jwt);

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
  login,
  loginByRole,
  logout,
  me,
  register,
  completeRegisterMaintainer
};
