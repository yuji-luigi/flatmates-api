import httpStatus from 'http-status';
import { NextFunction, Response } from 'express';
import logger from '../../lib/logger';
import Space from '../../models/Space';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { aggregateWithPagination, checkDuplicateEmail, convert_idToMongooseId } from '../helpers/mongoose.helper';
import vars from '../../utils/globalVariables';
import User from '../../models/User';
import { _MSG } from '../../utils/messages';
import { chunkArray, deleteEmptyFields, emptyFieldsToUndefined } from '../../utils/functions';
import { createMailOptionsForUserToken, createUserExcelPromises, userExcelData } from '../helpers/usersHelper';
import { convertExcelToJson } from '../../utils/excelHelper';
import { sendEmail } from '../helpers/nodemailerHelper';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { checkAuthTokenForError, findAuthTokenFromCookie } from '../helpers/authTokenHelper';
import { PipelineStage } from 'mongoose';
import ErrorEx from '../../errors/extendable.error';
import { deleteCrudObjectByIdAndSendDataWithPagination } from './DataTableController';
import AccessController from '../../models/AccessPermission';
import { ErrorCustom } from '../../lib/ErrorCustom';
import AuthToken from '../../models/AuthToken';
import Invitation from '../../models/Invitation';
import { createInvitationEmail } from '../../lib/node-mailer/createInvitationMail';
import { roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';

const entity = 'users';

const lookupSpaces: PipelineStage.FacetPipelineStage = {
  $lookup: { from: 'spaces', localField: 'spaces', foreignField: '_id', as: 'spaces' }
};

export const createUserAndSendDataWithPagination = async (req: RequestCustom, res: Response) => {
  try {
    // todo: control for user accessPermission.
    if (!req.user.isSuperAdmin) {
      throw new Error('You are not allowed to create access controller');
    }

    // if (!req.user.spaceId && !req.body.spaces.length) {
    //   throw new Error('space is not set. Please select the space.');
    // }
    // if (!req.user.organizationId) {
    //   throw new Error('organization is not set.');
    // }
    req.body = deleteEmptyFields(req.body);
    const { accessPermissions } = req.body;
    // req.body.user = req.user._id;
    // req.body.organization = req.user.organizationId;
    // req.body.space = req.user.spaceId;
    // req.body.spaces = [req.user.spaceId];

    if (!req.body.password) {
      throw new Error('Password is required. Please provide password.');
    }
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      throw new Error('Email is already in use. Please check the email.');
    }
    const newUser = new User(req.body);

    for (const accessPermission of accessPermissions) {
      const newAccessController = new AccessController({ ...accessPermission, user: newUser._id });
      await newAccessController.save();
    }
    await newUser.save();
    // case accessPermission is sent from the client, create and attach the user

    // modify query for user model.
    // req.query.spaces = req.user.spaceId ? { $in: [req.user.spaceId] } : null;
    delete req.query.space;

    req.query = convert_idToMongooseId(req.query);

    const data = await aggregateWithPagination(req.query, entity, [lookupSpaces]);

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (err) {
    logger.error(err.stack || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export async function sendUsersToClient(req: RequestCustom, res: Response) {
  try {
    const resultACtrl = await aggregateWithPagination(req.query, 'accessPermissions', [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user',
          doc: { $first: '$$ROOT' } // Keep the first document encountered for each unique user
        }
      },
      { $replaceRoot: { newRoot: '$doc' } }
    ]);
    const users = resultACtrl[0].paginatedResult.map((actrl) => actrl.user);
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: users,
      totalDocuments: resultACtrl[0].counts[0]?.total || 0
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}

/**
 *
 * check if the user has the organization
 *
 * 1.clear space cookie
 * 2. set organization cookie
 * 3. send main/root spaces of the organization to show in the select input
 * 4. show all the contents of the organization until select space
 * @description only admin of the organization can select the organization. to get all the spaces of the organization
 *  */
export async function organizationSelected(req: RequestCustom, res: Response) {
  try {
    res.clearCookie('space', { domain: vars.cookieDomain });
    res.cookie('organization', req.params.organizationId, { domain: vars.cookieDomain });
    const spaces = await Space.find({ organization: req.params.organizationId, isMain: true }).lean();

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations spaces',
      data: spaces
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}

export async function sendUsersSelectionForSuperAdmin(_req: RequestCustom, res: Response) {
  try {
    const data = await User.find({});
    res.clearCookie('space', { domain: vars.cookieDomain });
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: data
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}

export async function updateOrganizationById(req: RequestCustom, res: Response) {
  try {
    const organization = await User.findById(req.params.organizationId);
    // const {name, descripition, phone, email, homepage, logoBanner, logoSquare, admins, isPublic} = req.body;
    // const organization = await User.findById(req.params.organizationId).lean();
    const reqBody = deleteEmptyFields(req.body);
    organization.set(reqBody);
    await organization.save();

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: organization
      // totalDocuments:
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}

export async function deleteOrganizationByIdWithPagination(req: RequestCustom, res: Response) {
  try {
    const foundSpace = await Space.find({
      organization: {
        $in: req.params.organizationId
      }
    })
      .limit(1)
      .lean();

    if (foundSpace.length) {
      throw new Error('This organization has spaces. Please delete them first.');
    }
    const deletedOrganization = await User.findByIdAndDelete(req.params.organizationId);

    const data = await aggregateWithPagination(req.query, 'organizations');

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: data[0].paginatedResult || [],
      deletedCount: deletedOrganization ? 1 : 0,
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}

export async function deleteOrganizationById(req: RequestCustom, res: Response) {
  try {
    const foundSpace = await Space.find({
      organization: {
        $in: req.params.organizationId
      }
    })
      .limit(1)
      .lean();

    if (foundSpace.length) {
      throw new Error('This organization has spaces. Please delete them first.');
    }
    const deletedOrganization = await User.findByIdAndDelete(req.params.organizationId);

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: deletedOrganization,
      deletedCount: deletedOrganization ? 1 : 0
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}

export async function deleteOrganizationCookie(_req: RequestCustom, res: Response) {
  res.clearCookie('organization', { domain: vars.cookieDomain });
  res.status(httpStatus.OK).json({
    success: true,
    collection: 'organizations',
    data: {}
  });
}

export async function importExcelFromClient(req: RequestCustom, res: Response) {
  try {
    const fileFromClient = req.files.file;
    // Parse the file based on its type
    const data = convertExcelToJson<userExcelData>(fileFromClient);
    const space = req.user.currentSpace._id;
    const organization = req.user.currentSpace.organizationId;
    if (!space)
      throw new ErrorEx({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Please set the select input value in some building/space',
        stack: 'importExcelFromClient',
        detail: 'detail'
      });

    // SECOND IMPLEMENTATION: PROMISE.ALL
    const promises = createUserExcelPromises({ excelData: data, space, organization });
    const CHUNK_SIZE = 100;
    const chunks = chunkArray(promises, CHUNK_SIZE);
    for (const chunk of chunks) {
      // Execute each promise in the chunk so every 100 promises are executed in parallel
      await Promise.all(chunk.map((fn) => fn()));
    }
    //todo:
    // const userQueries = data.map((excelData) => {
    //   return {
    //     name: excelData.name,
    //     surname: excelData.surname,
    //     spaces: { $in: [space] }
    //   };
    // });
    // const foundUsers = await User.find({ $or: userQueries }, '_id');

    // todo:
    // await handleCreateAuthTokensForUser(
    //   foundUsers.map((user) => user._id),
    //   req.user.spaceId
    // );

    const users = await aggregateWithPagination(req.query, 'users');

    res.status(httpStatus.OK).json({
      collection: 'users',
      success: true,
      data: users[0].paginatedResult || [],
      totalDocuments: users[0].counts[0]?.total || 0,
      message: 'Data saved successfully'
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      success: false
    });
  }
}

export async function sendTokenEmail(req: RequestCustom, res: Response) {
  try {
    const mailOptions = await createMailOptionsForUserToken({ userId: req.params.idMongoose });
    const result = await sendEmail(mailOptions);
    logger.debug({ rejectedEmails: result.rejected });
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'users',
      data: result
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: _MSG.ERRORS.GENERIC,
      details: error.message || error,
      location: 'UserController.sendTokenEmail',
      success: false
    });
  }
}

export async function sendAuthTokenOfUserToClient(_req: RequestCustom, res: Response) {
  try {
    // if (!req.user.spaceId) {
    //   throw new Error('space is not set. Please select the space in the header nav first to generate the qr code.');
    // }
    // let conjunctionDoc = await UserSpaceConjunction.findOne({
    //   user: req.params.idMongoose,
    //   space: req.user.spaceId
    // });
    // if (!conjunctionDoc) {
    //   conjunctionDoc = await UserSpaceConjunction.create({
    //     user: req.params.idMongoose,
    //     space: req.user.spaceId
    //   });
    // }

    // let authToken = await AuthToken.findOne({
    //   userSpaceConjunction: conjunctionDoc._id
    // });

    // if (!authToken) {
    //   authToken = await AuthToken.create({
    //     userSpaceConjunction: conjunctionDoc._id
    //   });
    // }
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'users'
      // data: { _id: authToken._id, linkId: authToken._id, active: authToken.active }
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
}

export const updateUserById = async (req: RequestCustom, res: Response) => {
  try {
    const modifiedModel = await findAndModifyUserBase(req);
    await modifiedModel.save();
    await modifiedModel.populate({ path: 'spaces', select: 'name' });
    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.OBJ_UPDATED,
      collection: entity,
      data: modifiedModel,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const deleteUserByIdAndSendDataWithPagination = async (req: RequestCustom, res: Response) => {
  try {
    req.query.organizations = req;
    await deleteCrudObjectByIdAndSendDataWithPagination(req, res);
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const registerUserOnBoardingAndSendUserToClient = async (req: RequestCustom, res: Response) => {
  try {
    if (!req.body.password) {
      throw new Error(_MSG.PASSWORD_REQUIRED);
    }
    const authToken = await findAuthTokenFromCookie(req.cookies['auth-token']);
    // throws error if token is not valid
    checkAuthTokenForError(authToken);

    const modifiedUser = await findAndModifyUserBase(req);
    modifiedUser.set({ active: true });
    await modifiedUser.save();

    authToken.set({ active: false });
    await authToken.save();
    res.clearCookie('auth-token', { domain: vars.cookieDomain });
    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.OBJ_UPDATED,
      collection: entity,
      data: modifiedUser,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

/**
 *
 * @param req
 * @description find user by req.params.idMongoose and modify the fields of the user. but does not save the user. Also checks duplicate mail(breaks single responsibility principle)=> 1 find, 2 modify, 3 check duplicate mail. there are 3 responsibilities.
 * @returns modified user
 */
async function findAndModifyUserBase(req: RequestCustom) {
  const { idMongoose } = req.params;
  const foundUser = await User.findById(idMongoose);

  const emailDuplicates = await checkDuplicateEmail({ model: User, user: foundUser as IUser, email: req.body.email });
  const reqBody = emptyFieldsToUndefined(req.body);
  if (emailDuplicates) {
    throw new Error('Email is already in use. Please check the email.');
  }
  const { email, password, name, surname, phone, spaces, role } = reqBody;
  foundUser.set({ email, name, surname, phone, role: 'user' });
  password && foundUser.set({ password });
  if (req.user.isSuperAdmin) {
    spaces && foundUser.set({ spaces });
    role && foundUser.set({ role });
  }

  // const updatedModel = await foundUser.save();
  return foundUser;
}

export async function inviteUserToSpace(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    const { userType: userTypeName } = req.params;
    const { email, space } = req.body;
    if (!req.user.isAdminOfCurrentSpace && !req.user.isSuperAdmin) {
      throw new ErrorCustom('you are not allowed to invite user to space.', httpStatus.UNAUTHORIZED);
    }

    const authToken = new AuthToken();

    await authToken.save();

    const userType = roleCache.get(userTypeName);

    await Invitation.create({
      email,
      space,
      userType: userType.name,
      authToken
    });

    const mailOptions = await createInvitationEmail({ email, space, userType, authToken });
    await sendEmail(mailOptions);
    // const authToken = await AuthToken.create({
    //   email
    // }).save();

    // const mailOptions = await createMailOptionsForUserToken({ userId: req.params.idMongoose });

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'users',
      data: userType
    });
  } catch (error) {
    next(error);
  }
}
