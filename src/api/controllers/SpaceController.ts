import { Request, Response } from 'express';
import logger from '../../lib/logger';

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Space from '../../models/Space';
import { deleteEmptyFields } from '../../utils/functions';
import { aggregateWithPagination } from '../helpers/mongoose.helper';
import { RequestCustom as _RequestCustom } from '../../types/custom-express/express-custom';
import vars, { sensitiveCookieOptions } from '../../utils/globalVariables';
import { aggregateDescendantIds } from '../helpers/spaceHelper';
import { _MSG } from '../../utils/messages';
import { ObjectId } from 'mongodb';
import { LOOKUP_PIPELINE_STAGES } from '../aggregation-helpers/lookups';
import { signJwt } from '../../lib/jwt/jwtUtils';
import { JWTPayload } from '../../lib/jwt/JwtPayload';
import { isAdminOfSpace } from '../../middlewares/auth-middlewares';
import { Maintainer } from '../../models/util-models/user-by-user-type/Maintainer';
import { ErrorCustom } from '../../lib/ErrorCustom';
import { ReqUser } from '../../lib/jwt/jwtTypings';
const entity = 'spaces';

// NOTE: user is always present
interface RequestCustom extends _RequestCustom {
  user: ReqUser;
}
export const sendSpacesToClient = async (req: RequestCustom, res: Response) => {
  try {
    const currentSpaceId = req.user.currentSpace?._id?.toString();
    const spaceIds = currentSpaceId ? await aggregateDescendantIds(currentSpaceId, req.user) : ['does not exist'];
    let { query } = req;
    const spaceIdObj = query.space ? { _id: query.space } : {};
    query = currentSpaceId ? { ...query, _id: { $in: [...spaceIds, currentSpaceId] } } : { ...query, ...spaceIdObj };
    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    delete query.space;
    const data = await Space.find(query).lean();

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data,
      totalDocuments: data.length
    });
  } catch (err) {
    logger.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: _MSG.ERRORS.GENERIC,
      details: err.message || err
    });
  }
};

export const createHeadSpaceWithPagination = async (req: Request & { user: ReqUser }, res: Response) => {
  try {
    console.log(req.user.currentSpace);
    console.log(req.user?.currentAccessPermission);
    const newSpace = new Space({
      ...req.body,
      isHead: true
    });
    await newSpace.save();
    req.query.isHead = 'true';
    const data = await aggregateWithPagination(req.query, 'spaces');
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const sendMainSpacesWithPaginationToClient = async (req: RequestCustom, res: Response) => {
  try {
    const entity = 'spaces';

    // const limit = 10;

    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    // const { query } = req;
    req.query.isMain = true;
    const lookups = LOOKUP_PIPELINE_STAGES.spaces;

    if (!req.user?.isSuperAdmin || req.query.space) {
      req.query._id = req.query.space;
    }

    delete req.query.space;
    const data = await aggregateWithPagination(req.query, entity, lookups);

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendSingleSpaceToClientByCookie = async (_req: RequestCustom, res: Response) => {
  try {
    const entity = 'spaces';

    // const limit = 10;

    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    // const { query } = req;

    // const data = await Space.findById(req.user.spaceId);
    // data.cover && (await data.cover.setUrl(true));

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      // data: data,
      totalDocuments: 1
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendSpaceDataForSSG = async (_req: RequestCustom, res: Response) => {
  try {
    const entity = 'spaces';

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: {
        space: {}
        // threads,
        // maintenances,
        // maintainers
      },
      totalDocuments: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: _MSG.ERRORS.GENERIC
    });
  }
};
export const getLinkedChildrenSpaces = async (req: RequestCustom, res: Response) => {
  try {
    //! set pagination logic here and next > parentId page set the pagination logic
    const { parentId } = req.params;
    req.query.parentId = parentId;
    const lookups = LOOKUP_PIPELINE_STAGES.spaces;

    const data = await aggregateWithPagination(req.query, entity, lookups);
    res.status(httpStatus.OK).json({
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

export const sendSingleSpaceByIdToClient = async (req: RequestCustom, res: Response) => {
  try {
    // return res.send('ok');
    const data = await Space.findOne(new ObjectId(req.params.spaceId));

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: data,
      totalDocuments: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const sendSpaceSettingPageDataToClient = async (req: RequestCustom, res: Response) => {
  try {
    const data = await Space.findOne({ slug: req.params.slug });
    const maintainers = await Maintainer.find({
      matchStage: { spaces: { $in: [data?._id] } }
    });
    const isSpaceAdmin = isAdminOfSpace({ space: data, currentUser: req.user });
    // await setUrlToSpaceImages(data);
    for (const maintainer of maintainers) {
      await maintainer.avatar?.setUrl();
    }

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: {
        space: data,
        maintainers,
        isSpaceAdmin
      },
      totalDocuments: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const createLinkedChildSpace = async (req: RequestCustom, res: Response) => {
  try {
    const { parentId } = req.params;
    const entity = 'spaces';
    req.body = deleteEmptyFields(req.body);
    req.body.parentId = parentId; // set the parentId in req.body
    req.body.isTail = false; // set the tail to be false.

    // get the model

    const Model = mongoose.model(entity);

    const childDoc = new Model({ ...req.body });
    const newChildDoc = await childDoc.save();
    logger.debug(newChildDoc._doc);

    req.query = { ...req.query, parentId };
    const data = await aggregateWithPagination(req.query, entity);

    res.status(httpStatus.OK).json({
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

export const sendHeadSpaces = async (req: Request, res: Response) => {
  try {
    const entity = 'spaces';
    req.query.isHead = 'true';
    const data = await aggregateWithPagination(req.query, entity);
    res.status(httpStatus.OK).json({
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

// if super admin send organizations
export const sendSpaceSelectionToClient = async (req: RequestCustom, res: Response) => {
  try {
    const entity = 'spaces';

    const data = await Space.find({
      _id: {
        $in: req.user?.accessPermissions?.map((actrl) => actrl.space)
      }
    });

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data,
      totalDocuments: data.length
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

//! TODO: from next chose to call generic parameter route
export const deleteLinkedChildSpace = async (req: Request, res: Response) => {
  try {
    let { entity } = req.params;
    const { id } = req.params;
    id;
    entity = 'spaces';
    const deletedDocument = await mongoose.model(entity).findOneAndDelete({ _id: id });
    req.query.parentId = deletedDocument.parentId;
    const data = await aggregateWithPagination(req.query, entity);

    res.status(httpStatus.OK).json({
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

//! TODO: find way to delete all the children tree of the parent.
export const deleteHeadSpaceWithPagination = async (req: Request, res: Response) => {
  try {
    /**
     * todo:
     * Now only space for the delete one head by id
     * will be set a flag in the frontend. to switch head operations.
     */
    const { spaceId } = req.params;

    const foundChildren = await Space.find({ parentId: spaceId }).limit(1).lean();
    if (foundChildren.length) {
      throw new Error('Cannot delete the space. Please delete other spaces under the space you are deleting.');
    }

    await Space.findByIdAndDelete({ _id: spaceId });

    const query = { isHead: 'true' };
    const data = await aggregateWithPagination(query, 'spaces');

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const deleteSpaceCookie = async (req: RequestCustom, res: Response) => {
  try {
    deleteSpaceCookies(res);
    if (!req.user) throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
    const payload = JWTPayload.simple({
      email: req.user.email,
      loggedAs: req.user.loggedAs.name,
      userType: req.user.loggedAs.name
    });
    const jwt = signJwt(payload);

    res.clearCookie('jwt', { domain: vars.cookieDomain });
    res.cookie('jwt', jwt, sensitiveCookieOptions);

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: 'space cookie deleted'
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error
    });
  }
};

export function deleteSpaceCookies(res: Response) {
  res.clearCookie('spaceId', {
    domain: vars.cookieDomain
  });
  res.clearCookie('spaceSlug', {
    domain: vars.cookieDomain
  });
  res.clearCookie('spaceAddress', {
    domain: vars.cookieDomain
  });
  res.clearCookie('spaceName', {
    domain: vars.cookieDomain
  });
}

export async function sendDescendantIdsToClient(req: RequestCustom, res: Response) {
  try {
    const spaceIds = await aggregateDescendantIds(req.params.spaceId, req.user);
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: spaceIds,
      totalDocuments: spaceIds.length
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error
    });
  }
}

export async function sendHeadToTailToClient(req: RequestCustom, res: Response) {
  try {
    const spaceIds = await aggregateDescendantIds(req.params.spaceId, req.user);
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: spaceIds,
      totalDocuments: spaceIds.length
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error
    });
  }
}
export async function sendMainSpacesSlug(_req: RequestCustom, res: Response) {
  try {
    const mainSpaces = await Space.find({ isMain: true }).lean();
    const slugs = mainSpaces.map((space) => space.slug);
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: slugs,
      totalDocuments: mainSpaces.length
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error in sending main spaces slugs function.'
    });
  }
}

export async function updateSpaceAndSendToClient(req: RequestCustom, res: Response) {
  try {
    const space = await Space.findById(req.params.idMongoose);
    if (!isAdminOfSpace({ space, currentUser: req.user })) {
      throw new Error(_MSG.NOT_AUTHORIZED);
    }
    if (!space) {
      throw new ErrorCustom(_MSG.NOT_FOUND, httpStatus.NOT_FOUND);
    }

    delete req.body.isMain;

    space.set(req.body);
    await space.save();
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: space,
      totalDocuments: 1
    });
  } catch (error) {
    logger.error(error.stack || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      collection: entity,
      message: _MSG.ERRORS.GENERIC
    });
  }
}

export async function sendIsAdminToClient(req: RequestCustom, res: Response) {
  try {
    const space = await Space.findById(req.params.idMongoose);
    const isAdmin = isAdminOfSpace({ space, currentUser: req.user });
    res.status(httpStatus.OK).json({
      success: true,
      data: isAdmin
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: _MSG.ERRORS.GENERIC
    });
  }
}
