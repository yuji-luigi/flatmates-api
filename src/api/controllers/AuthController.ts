// import { IUser } from './../../types/model/user.d';
// import { RegisterData } from './../../types/auth/formdata.d';
/** *********** User ************* */
import { Request, Response } from 'express';
import moment from 'moment-timezone';
import httpStatus from 'http-status';
import User from '../../models/User';
// import { UserModel } from 'model/user';
import vars, { sensitiveCookieOptions } from '../../config/vars';
import { _MSG } from '../../utils/messages';
import logger from '../../config/logger';
import { RequestCustom } from '../../types/custom-express/express-custom';
import Space from '../../models/Space';
import Organization from '../../models/Organization';
import { IOrganization } from '../../types/mongoose-types/model-types/organization-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';

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
    const { email, password, password2, name, surname, purpose, organization, space } = req.body as RegisterData;

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
      role: 'user'
    }) as any;

    const newOrganization = await Organization.create({
      name: organization
    });

    const accessToken = newUser.token();
    const token = generateTokenResponse(newUser as any, accessToken);
    res.cookie('jwt', token.accessToken, {
      httpOnly: true,
      sameSite: true,
      maxAge: 99999999,
      domain: cookieDomain
    });
    const newRootSpace = await createNewSpace({ space, purpose, user: newUser, organization: newOrganization });

    newUser.rootSpaces.push(newRootSpace);
    const createdUser = await newUser.save();

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

async function createNewSpace({
  space,
  // purpose,
  user,
  organization
}: {
  space: { name: string; address: string; maxUsers: number; password: string };
  purpose: PurposeUser;
  user: IUser;
  organization: IOrganization | string;
}) {
  try {
    const createdSpace = await Space.create({
      name: space.name,
      address: space.address,
      spaceType: 'building',
      isHead: true,
      isTail: true,
      admins: [user._id],
      maxUsers: space.maxUsers,
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
    // const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const { user, accessToken } = await User.findAndGenerateToken<IUser>(req.body);

    const token = generateTokenResponse(user, accessToken);
    // const userTransformed = user.transform();
    // Send Set-Cookie header
    const domain = cookieDomain;
    logger.info({ domain });
    // res.clearCookie('jwt');
    // res.clearCookie('space');
    res.cookie('jwt', token.accessToken, sensitiveCookieOptions);
    // if (!user.isSuperAdmin()) {
    //   // res.cookie('organization', user.organization._id.toString(), sensitiveCookieOptions);
    // }

    res.send({
      success: true,
      data: { token /* , user: userTransformed */ }
      // accessToken: token
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

export default {
  removeSpaceToken,
  login,
  logout,
  me,
  register
};
