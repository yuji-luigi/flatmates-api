import httpStatus from 'http-status';
import { Response } from 'express';
import logger from '../../config/logger';
import Space from '../../models/Space';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { aggregateWithPagination, checkDuplicateEmail, convert_idToMongooseId } from '../helpers/mongoose.helper';
import vars from '../../config/vars';
import User from '../../models/User';
import { _MSG } from '../../utils/messages';
import { deleteEmptyFields, emptyFieldsToUndefined } from '../../utils/functions';
import { createMailOptionsForUserToken, deleteDuplicateEmailField, handleConstructUpdateUser, userExcelData } from '../helpers/usersHelper';
import { convertExcelToJson } from '../../utils/excelHelper';
import { sendEmail } from '../helpers/nodemailerHelper';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { findAuthTokenFromCookie } from '../helpers/authTokenHelper';
import { PipelineStage } from 'mongoose';

const entity = 'users';

const lookupSpaces: PipelineStage.FacetPipelineStage = {
  $lookup: { from: 'spaces', localField: 'rootSpaces', foreignField: '_id', as: 'rootSpaces' }
};
export const createUserAndSendDataWithPagination = async (req: RequestCustom, res: Response) => {
  try {
    if (!req.space) {
      throw new Error('space is not set.');
    }
    // get req.params.entity
    const entity = 'users';
    req.body = deleteEmptyFields(req.body);
    req.body.user = req.user._id;
    req.body.organization = req.space.organization;
    req.body.space = req.space._id;
    req.body.rootSpaces = [req.space._id];

    if (!req.body.password) {
      throw new Error('Password is required. Please provide password.');
    }
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      throw new Error('Email is already in use. Please check the email.');
    }

    const newModel = new User(req.body);

    await newModel.save();
    // modify query for user model.
    req.query.rootSpaces = req.space ? { $in: [req.space._id] } : null;
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
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export async function sendUsersToClient(req: RequestCustom, res: Response) {
  try {
    const user = await User.findById(req.user._id);
    //! todo: put array of root spaces instead of setting organization. because user can be admin/inhabitant of multiple organizations.
    if (!user.isSuperAdmin()) {
      // req.query.organization = user.organization;
      req.query.rootSpaces = req.space ? { $in: [req.space._id] } : null;
    }
    delete req.query.space;

    const users = await aggregateWithPagination(req.query, 'users', [lookupSpaces]);

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: users[0].paginatedResult || []
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
    const user = await User.findById(req.user._id);

    if (!(await user.isAdminOrganization(req.params.organizationId))) {
      throw new Error(_MSG.NOT_AUTHORIZED);
    }

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

export async function sendUsersSelectionForSuperAdmin(req: RequestCustom, res: Response) {
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
    const user = await User.findById(req.user._id);
    if (!(await user.isAdminOrganization(req.params.organizationId))) {
      throw new Error(_MSG.NOT_AUTHORIZED);
    }
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

export async function deleteOrganizationCookie(req: RequestCustom, res: Response) {
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
    const mainSpace = req.space;

    // data is array of user data, current is single user data
    for (let current of data) {
      current = await deleteDuplicateEmailField(current);
      const newUser = await handleConstructUpdateUser({ excelData: current, mainSpace });
      await newUser.save();
    }
    // Save the data to the database
    console.log('Data saved successfully');
    const users = await aggregateWithPagination(req.query, 'users');
    res.status(httpStatus.OK).json({
      collection: 'users',
      success: true,
      data: users[0].paginatedResult || [],
      message: 'Data saved successfully'
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
}

export async function sendTokenEmail(req: RequestCustom, res: Response) {
  try {
    const mailOptions = await createMailOptionsForUserToken({ userId: req.params.idMongoose });
    const result = await sendEmail(mailOptions);
    logger.info(result);
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'users',
      data: result
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
    const modifiedModel = await findAndModifyUserFields(req);
    await modifiedModel.save();
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

export const userOnBoarding = async (req: RequestCustom, res: Response) => {
  try {
    const authToken = await findAuthTokenFromCookie(req.cookies['auth-token']);
    if (!authToken) {
      throw new Error(_MSG.INVALID_ACCESS);
    }
    if (!req.body.password) {
      throw new Error(_MSG.PASSWORD_REQUIRED);
    }
    const modifiedUser = await findAndModifyUserFields(req);
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
async function findAndModifyUserFields(req: RequestCustom) {
  const { idMongoose } = req.params;
  const foundUser = await User.findById(idMongoose);

  const emailDuplicates = await checkDuplicateEmail({ model: User, user: foundUser as IUser, email: req.body.email });
  const reqBody = emptyFieldsToUndefined(req.body);
  if (emailDuplicates) {
    throw new Error('Email is already in use. Please check the email.');
  }
  if (!reqBody.password) {
    delete reqBody.password;
  }
  foundUser.set(reqBody);
  // const updatedModel = await foundUser.save();
  return foundUser;
}
