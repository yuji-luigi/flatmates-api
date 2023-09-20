// import { IUser } from './../../types/model/user.d';
// import { RegisterData } from './../../types/auth/formdata.d';
/** *********** User ************* */
import { Request, Response } from 'express';
import moment from 'moment-timezone';
import httpStatus from 'http-status';
import User, { isSuperAdmin } from '../../models/User';
// import { UserModel } from 'model/user';
import vars, { sensitiveCookieOptions } from '../../config/vars';
import { _MSG } from '../../utils/messages';
import logger from '../../config/logger';
import { RequestCustom } from '../../types/custom-express/express-custom';
import Space from '../../models/Space';
import Organization from '../../models/Organization';
import { IOrganization } from '../../types/mongoose-types/model-types/organization-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { userHasSpace } from '../helpers/spaceHelper';
import { createJWTObjectFromJWTAndSpace, resetSpaceCookies, setJwtCookie } from '../../utils/jwt/jwtUtils';
// import { CurrentSpace } from '../../types/mongoose-types/model-types/space-interface';

const { jwtExpirationInterval, cookieDomain } = vars;

/**
 * Returns a formatted object with tokens
 * @private
 */
function generateTokenResponse(user: any, accessToken: string) {
  const tokenType = 'Bearer';
  const expiresIn = moment().add(jwtExpirationInterval, 'seconds');
  return {
    tokenType,
    accessToken,
    expiresIn
  };
}

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
    const createdUser = await newUser.save();
    const jwt = createJWTObjectFromJWTAndSpace({ user: createdUser, space: newRootSpace });
    setJwtCookie(res, jwt);
    // res.cookie('organization', organizationToken, sensitiveCookieOptions);
    // res.cookie('space', spaceCookie, sensitiveCookieOptions);
    // res.cookie('jwt', token.accessToken, sensitiveCookieOptions);

    res.status(httpStatus.CREATED).send({
      success: true,
      message: _MSG.OBJ_CREATED,
      user: createdUser,
      accessToken,
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
const login = async (req: Request, res: Response) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    //clear all spaceCookies
    resetSpaceCookies(res);
    const token = generateTokenResponse(user, accessToken);
    res.cookie('jwt', token.accessToken, sensitiveCookieOptions);

    return res.send({
      success: true,
      data: { token }
    });
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
    user.last_login = new Date(Date.now());
    await user.save();

    return res.send({
      success: true,
      user
    });
  } catch (error) {
    logger.error(error.message || error);
    res.send('error');
  }
};

export const sendMainSpaceSelectionsToClient = async (req: RequestCustom, res: Response) => {
  try {
    // case user show user.rootSpaces

    let query: Record<string, string | any> = { isMain: true, _id: { $in: req.user.rootSpaces } };
    // let mainSpaces = await Space.find({ isMain: true, _id: { $in: req.user.rootSpaces } });
    // case admin show all main spaces of his organizations
    if (req.user.role === 'admin') {
      query = { isMain: true, organization: { $in: req.user.organizations } };
      // mainSpaces = await Space.find({ isMain: true, organization: { $in: req.user.organizations } });
    }
    if (req.user.role === 'super_admin') {
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
    const query = isSuperAdmin(req.user) ? {} : { _id: { $in: req.user.organizations } };
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
    const user = await User.findById(req.user._id);

    if (!user.isSuperAdmin() && !userHasSpace(user as IUser, req.params.idMongoose)) {
      throw new Error(_MSG.NOT_ALLOWED);
    }
    // user is super admin or has the root space.
    const space = await Space.findById(req.params.idMongoose);
    const jwt = createJWTObjectFromJWTAndSpace({ user: req.user, space });
    // const jwt = signJwt(updatedJwt);

    res.clearCookie('jwt', { domain: vars.cookieDomain });
    setJwtCookie(res, jwt);
    // res.cookie('jwt', jwt, sensitiveCookieOptions);

    // const spaceCookie = formatCurrentSpaceToJSON(space);
    // const expires = getJwtExpirationDate();
    // res.cookie('space', spaceCookie, { domain: vars.cookieDomain, expires });
    // res.cookie('spaceName', space.name, { domain: vars.cookieDomain, expires });
    // res.cookie('organization', space.organization, { domain: vars.cookieDomain, expires });

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: {
        space: {
          _id: space._id,
          name: space.name,
          address: space.address,
          slug: space.slug
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
  logout,
  me,
  register
};
