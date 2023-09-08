import { Request, Response } from 'express';
import logger from '../../config/logger';

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Space from '../../models/Space';
import { deleteEmptyFields } from '../../utils/functions';
import { aggregateWithPagination } from '../helpers/mongoose.helper';
import { RequestCustom } from '../../types/custom-express/express-custom';
import vars from '../../config/vars';
import User from '../../models/User';
import { aggregateDescendantIds, setUrlToSpaceImages, userHasSpace } from '../helpers/spaceHelper';
import { _MSG } from '../../utils/messages';
import Thread from '../../models/Thread';
import Maintenance from '../../models/Maintenance';
import Maintainer from '../../models/Maintainer';
import { ObjectId } from 'mongodb';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { LOOKUPS, UNWIND } from '../pipelines/lookups';
import { createJWTObjectFromJWTAndSpace, setJwtCookie } from '../../utils/authTokenUtil';
const entity = 'spaces';
// import MSG from '../../utils/messages';
// import { runInNewContext } from 'vm';
// import { deleteEmptyFields, getEntity } from '../../utils/functions';

//================================================================================
// CUSTOM CONTROLLER...
//================================================================================

export const sendSpacesToClient = async (req: RequestCustom, res: Response) => {
  try {
    if (!req.user) {
      throw new Error(_MSG.NOT_AUTHORIZED);
    }
    const currentSpaceId = req.user.spaceId.toString();
    const user = await User.findById(req.user._id);
    const spaceIds = await aggregateDescendantIds(currentSpaceId, user);

    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    const data = await Space.find({ _id: { $in: [...spaceIds, currentSpaceId] } });

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data,
      totalDocuments: data.length
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: _MSG.ERRORS.GENERIC,
      details: err.message || err
    });
  }
};

export const createHeadSpaceWithPagination = async (req: RequestCustom, res: Response) => {
  try {
    const newSpace = new Space({
      ...req.body,
      organization: req.user.organizationId,
      isHead: true,
      isMain: true
    });
    await newSpace.save();
    const query = { ...req.query, isHead: true };
    const data = await aggregateWithPagination(query, 'spaces');
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   collection: 'spaces',
    //   data: newSpace,
    //   count: 1
    // });
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
    const lookups = [LOOKUPS.ADMINS, UNWIND, LOOKUPS.ORGANIZATION, UNWIND];
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

export const sendSingleSpaceToClientByCookie = async (req: RequestCustom, res: Response) => {
  try {
    const entity = 'spaces';

    // const limit = 10;

    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    // const { query } = req;

    const data = await Space.findById(req.user.spaceId);
    data.cover && (await data.cover.setUrl(true));

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data,
      totalDocuments: 1
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendSpaceDataForHome = async (req: RequestCustom, res: Response) => {
  try {
    const entity = 'spaces';

    // const limit = 10;

    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    let { query } = req;
    let maintainerQuery = {};

    if (req.user?.spaceId) {
      query = { space: req.user.spaceId };
      maintainerQuery = { spaces: { $in: [req.user._id] } };
    }
    // case only for super_admin. selected only organization.
    if (req.user?.organizationId && !req.user?.spaceId) {
      const spaces = await Space.find({ organization: req.user.organizationId, isMain: true });
      maintainerQuery = { spaces: { $in: spaces.map((s) => s._id) } };
    }

    const threads = await Thread.find(query).limit(10);
    const maintenances = await Maintenance.find(query).limit(10);
    const maintainers = await Maintainer.find(maintainerQuery);

    // space.cover && (await space.cover.setUrl());

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: {
        space: {},
        threads,
        maintenances,
        maintainers
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
    const { parentId, entity } = req.params;
    // const children = await mongoose.model(entity).find({parentId: parentId});x
    req.query.parentId = parentId;
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

export const sendSingleSpaceByIdToClient = async (req: RequestCustom, res: Response) => {
  try {
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

export const sendSingleSpaceBySlugToClient = async (req: RequestCustom, res: Response) => {
  try {
    const data = await Space.findOne({ slug: req.params.slug });
    const maintainers = await Maintainer.find({ spaces: { $in: [data._id] } });

    await setUrlToSpaceImages(data);
    for (const maintainer of maintainers) {
      await maintainer.avatar?.setUrl();
    }

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: {
        space: data,
        maintainers
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
    /**
     * find model
     * create model with parentId in the correct field
     * save
     * send the data array to handle in redux
     */
    const { parentId } = req.params;
    const entity = 'spaces';
    req.body = deleteEmptyFields(req.body);
    req.body.parentId = parentId; // set the parentId in req.body
    req.body.isTail = false; // set the tail to be false.

    // get the model

    const Model = mongoose.model(entity);
    // const organizationOfUser = req.user.role !== 'super_admin' ? req.user.organization : null;

    // const parentDocument = await Model.findById(parentId); // find parentDocument

    const childDoc = new Model({ ...req.body });
    const newChildDoc = await childDoc.save();
    logger.debug(newChildDoc._doc);
    // parentDocument.isTail = false; // set isTail to false
    // await parentDocument.save(); // save
    // sendCrudObjectsWithPaginationToClient(req, res);
    req.query = { ...req.query, parentId };
    const data = await aggregateWithPagination(req.query, entity);

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   collection: 'spaces',
    //   data: newModel,
    //   count: 1
    // });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const sendHeadSpaces = async (req: Request, res: Response) => {
  try {
    const entity = 'spaces';
    // entity = cutQuery(entity);
    // without pagination
    // const children = await mongoose.model(entity).find({isHead: true});
    const query = { ...req.query, isHead: true };
    const data = await aggregateWithPagination(query, entity);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   collection: 'spaces',
    //   data: children,
    //   count: 1
    // });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

// if super admin send organizations
export const sendSpaceSelectionToClient = async (req: RequestCustom, res: Response) => {
  try {
    const entity = 'spaces';

    const data = await Space.find({ _id: { $in: req.user.rootSpaces } });

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
    /**
     * find model
     * create model with parentId in the correct field
     * save
     * send the data array to handle in redux
     */
    let { entity } = req.params;
    const { id } = req.params;
    id;
    entity = 'spaces';
    const deletedDocument = await mongoose.model(entity).findOneAndDelete({ _id: id });
    const query = {
      ...req.query,
      parentId: deletedDocument.parentId
    };
    const data = await aggregateWithPagination(query, entity);

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

    const query = { isHead: true };
    const data = await aggregateWithPagination(query, 'spaces');

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   collection: 'spaces',
    //   // data: data[0].paginatedResult || [],
    //   // totalDocuments: data[0].counts[0]?.total || 0
    // });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const addSpaceToJWTAndSendToClient = async (req: RequestCustom, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.isSuperAdmin() && !userHasSpace(user as IUser, req.params.spaceId)) {
      throw new Error(_MSG.NOT_ALLOWED);
    }
    // user is super admin or has the root space.
    const space = await Space.findById(req.params.spaceId);

    const jwt = createJWTObjectFromJWTAndSpace({ user: req.user, space });

    // const jwt = space.token();

    // res.clearCookie('space');

    // const httpOnlyFalseCookieOptions = {
    //   ...sensitiveCookieOptions,
    //   httpOnly: false
    // };
    res.clearCookie('jwt', { domain: vars.cookieDomain });
    setJwtCookie(res, jwt);
    // res.cookie('jwt', jwt, sensitiveCookieOptions);
    // res.cookie('space', jwt, httpOnlyFalseCookieOptions);
    // res.cookie('spaceName', space.name, { domain: vars.cookieDomain });

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: {
        space: {
          _id: space._id,
          name: space.name,
          address: space.address,
          organization: space.organization
        },
        jwt
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

export const deleteSpaceCookie = async (req: RequestCustom, res: Response) => {
  try {
    res.clearCookie('space', {
      domain: vars.cookieDomain
    });
    res.clearCookie('spaceName', {
      domain: vars.cookieDomain
    });

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

export async function sendDescendantIdsToClient(req: RequestCustom, res: Response) {
  try {
    const user = (await User.findById(req.user._id)) as IUser;
    const spaceIds = await aggregateDescendantIds(req.params.spaceId, user);
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
    const user = (await User.findById(req.user._id)) as IUser;
    const spaceIds = await aggregateDescendantIds(req.params.spaceId, user);
    // const spaces = await Space.find({ _id: { $in: spaceIds } }).lean();
    // const headToTail = buildHierarchy({spaces, rootSpace: });
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
export async function sendMainSpacesSlug(req: RequestCustom, res: Response) {
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
