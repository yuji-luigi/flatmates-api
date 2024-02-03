import httpStatus from 'http-status';
import { Response } from 'express';
import logger from '../../config/logger';
import Space from '../../models/Space';
import Organization from '../../models/Organization';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { aggregateWithPagination } from '../helpers/mongoose.helper';
import vars, { sensitiveCookieOptions } from '../../config/vars';
import User from '../../models/User';
import { _MSG } from '../../utils/messages';
import { deleteEmptyFields } from '../../utils/functions';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { createJWTObjectFromJWTAndSpace, formatUserDataForJwt, handleSetCookiesFromPayload, signJwt } from '../../lib/jwt/jwtUtils';

export async function sendOrganizations(req: RequestCustom, res: Response) {
  try {
    const user = await User.findById<IUser>(req.user._id);
    const userSpaces = await Space.find({ _id: { $in: user.rootSpaces } }).lean();

    let organizationIds = userSpaces.map((space) => {
      if (typeof space.organization === 'string') {
        return space.organization;
      }
      return space.organization._id;
    });
    const filteredArray = new Set(organizationIds);
    organizationIds = [...filteredArray];
    // super admin gets all organizations, other users get only their organizations
    const query = req.user.isSuperAdmin ? req.query : { ...req.query, _id: { $in: organizationIds } };
    // TEST CODE const query = { _id: { $in: ['6444f0a8c9243bfee443c53e', '643861526aec086124b0e0e7', '6432ceb45647e578ce20f896'] } };
    delete query.space;
    delete query.organization;
    delete query.organizations;
    delete query.rootSpaces;
    const data = await Organization.find(query).lean();

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
export async function sendOrganizationsWithPagination(req: RequestCustom, res: Response) {
  try {
    const user = await User.findById<IUser>(req.user._id);
    const userSpaces = await Space.find({ _id: { $in: user.rootSpaces } }).lean();

    let organizationIds = userSpaces.map((space) => {
      if (typeof space.organization === 'string') {
        return space.organization;
      }
      return space.organization._id;
    });
    const filteredArray = new Set(organizationIds);
    organizationIds = [...filteredArray];
    // super admin gets all organizations, other users get only their organizations
    const query = user.isSuperAdmin() ? req.query : { ...req.query, _id: { $in: organizationIds } };
    // TEST CODE const query = { _id: { $in: ['6444f0a8c9243bfee443c53e', '643861526aec086124b0e0e7', '6432ceb45647e578ce20f896'] } };
    delete query.space;
    const data = await aggregateWithPagination(query, 'organizations');

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}
export async function sendAllOrganizations(req: RequestCustom, res: Response) {
  try {
    const data = await Organization.find().lean();

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

    if (!req.user.isSuperAdmin && !(await user.isAdminOrganization(req.params.organizationId))) {
      throw new Error(_MSG.NOT_AUTHORIZED);
    }
    const organization = await Organization.findById(req.params.organizationId).lean();
    // const jwt = signJwt({ ...formattedUser, organizationId: req.params.organizationId });

    // res.cookie('jwt', jwt, sensitiveCookieOptions);
    // res.cookie('organization', req.params.organizationId, sensitiveCookieOptions);
    // res.cookie('organizationName', organization.name, { domain: vars.cookieDomain });
    const spaces = await Space.find({ organization: req.params.organizationId, isMain: true }).populate({ path: 'cover', select: 'url' }).lean();
    const jwtPayload = createJWTObjectFromJWTAndSpace({ user: req.user, organizationId: organization._id.toString() });
    handleSetCookiesFromPayload(res, jwtPayload);
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

export async function sendOrganizationsSelectionForSuperAdmin(req: RequestCustom, res: Response) {
  try {
    const data = await Organization.find({});
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
    const organization = await Organization.findById(req.params.organizationId);
    // const {name, descripition, phone, email, homepage, logoBanner, logoSquare, admins, isPublic} = req.body;
    // const organization = await Organization.findById(req.params.organizationId).lean();
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
    const deletedOrganization = await Organization.findByIdAndDelete(req.params.organizationId);

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
    const deletedOrganization = await Organization.findByIdAndDelete(req.params.organizationId);

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
  if (req.user.role !== 'super_admin') {
    throw new Error(_MSG.NOT_AUTHORIZED);
  }
  const payloadUser = formatUserDataForJwt(req.user);
  const upDatedJwt = signJwt(payloadUser);

  // res.clearCookie('organization', { domain: vars.cookieDomain });
  // res.clearCookie('space', { domain: vars.cookieDomain });
  // res.clearCookie('spaceName', { domain: vars.cookieDomain });
  // res.clearCookie('organizationName', { domain: vars.cookieDomain });

  res.cookie('jwt', upDatedJwt, sensitiveCookieOptions);
  console.log(sensitiveCookieOptions);
  res.status(httpStatus.OK).json({
    success: true,
    collection: 'organizations',
    data: {}
  });
}
