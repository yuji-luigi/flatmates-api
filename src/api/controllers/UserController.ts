import httpStatus from 'http-status';
import { Response } from 'express';
import logger from '../../config/logger';
import Space from '../../models/Space';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { aggregateWithPagination, convert_idToMongooseId } from '../helpers/mongoose.helper';
import vars from '../../config/vars';
import User from '../../models/User';
import xlsx from 'xlsx';
import { _MSG } from '../../utils/messages';
import { deleteEmptyFields } from '../../utils/functions';

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
    const newModel = new User(req.body);

    await newModel.save();
    // modify query for user model.
    req.query.rootSpaces = req.space ? { $in: [req.space._id] } : null;
    delete req.query.space;

    req.query = convert_idToMongooseId(req.query);

    const data = await aggregateWithPagination(req.query, entity);

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

    if (!user.isSuperAdmin()) {
      req.query.organization = user.organization;
      req.query.rootSpaces = req.space ? { $in: [req.space._id] } : null;
    }
    delete req.query.space;
    const users = await aggregateWithPagination(req.query, 'users');

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
    let data;
    if (
      !Array.isArray(fileFromClient) &&
      ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(fileFromClient.mimetype)
    ) {
      // Excel file
      const workbook = xlsx.read(fileFromClient.data, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      data = xlsx.utils.sheet_to_json(worksheet);
    } else {
      // Unsupported file type
      throw new Error('Unsupported file type');
    }
    ''.toLowerCase().replace(/\s/g, '');

    // Save the data to the database
    console.log('Data saved successfully');
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Data saved successfully',
      data
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
}
