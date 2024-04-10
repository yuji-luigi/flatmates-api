import httpStatus from 'http-status';
import { Response } from 'express';
import logger from '../../lib/logger';
import Space from '../../models/Space';
import Organization from '../../models/Organization';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { aggregateWithPagination } from '../helpers/mongoose.helper';
import vars, { sensitiveCookieOptions } from '../../utils/globalVariables';
import { _MSG } from '../../utils/messages';
import { deleteEmptyFields } from '../../utils/functions';
import { handleSetCookiesFromPayload, signJwt } from '../../lib/jwt/jwtUtils';
import { JWTPayload } from '../../lib/jwt/JwtPayload';
import { handleGenerateTokenByRoleAfterLogin } from '../../utils/login-instance-utils/generateTokens';

export async function sendOrganizations(req: RequestCustom, res: Response) {
  try {
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations',
      data: 'data'
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}
export async function sendOrganizationsWithPagination(req: RequestCustom, res: Response) {
  try {
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'organizations'
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
    const spaces = await Space.find({ organization: req.params.organizationId, isMain: true }).populate({ path: 'cover', select: 'url' }).lean();
    const jwtPayload = JWTPayload.simple({
      email: req.user.email,
      loggedAs: req.user.loggedAs.name,
      userType: req.user.loggedAs.name
    });
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
    const organization = await Organization.findById(req.params.organizationId);
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
  try {
    if (!req.user.isSuperAdmin && req.user.loggedAs.name === 'inhabitant') {
      throw new Error(_MSG.NOT_AUTHORIZED);
    }
    const payloadUser = handleGenerateTokenByRoleAfterLogin(req.user);
    const upDatedJwt = signJwt(payloadUser);

    res.clearCookie('organizationId', { domain: vars.cookieDomain });
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
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}
