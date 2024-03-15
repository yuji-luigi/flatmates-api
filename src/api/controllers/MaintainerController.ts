import { FilterOptions } from './../../types/mongoose-types/pipelines/pipeline-type';
import httpStatus from 'http-status';
import logger from '../../lib/logger';
import { Response } from 'express';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { _MSG } from '../../utils/messages';
import Space from '../../models/Space';
import { RoleCache, roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import User from '../../models/User';
import AccessPermission from '../../models/AccessPermission';
import { ErrorCustom } from '../../lib/ErrorCustom';
import { Maintainer } from '../../models/util-models/Maintainer';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { accessPermissionsCache } from '../../lib/mongoose/mongoose-cache/access-permission-cache';
import { ObjectId } from 'bson';

const entity = 'users';

export const createMaintainer = async (req: RequestCustom, res: Response) => {
  try {
    const foundMaintainer = await Maintainer.findOne({ matchStage: { email: req.body.email } });
    if (foundMaintainer) {
      throw new Error(_MSG.MAINTAINER_EXISTS);
    }

    req.body.createdBy = req.user;

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};

export const addMaintainerToSpace = async (req: RequestCustom, res: Response) => {
  try {
    const foundMaintainer = await User.findById(req.params.idMaintainer);
    const space = await Space.findById(req.params.idSpace);
    const foundPermission = await AccessPermission.findOne({ user: foundMaintainer, space });
    if (foundPermission) {
      throw new ErrorCustom(_MSG.MAINTAINER_EXISTS, httpStatus.CONFLICT);
    }
    await AccessPermission.create({
      user: foundMaintainer,
      space,
      role: roleCache.get('Maintainer')._id
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      message: _MSG.OBJ_CREATED,
      data: foundMaintainer
    });
  } catch (error) {
    console.error(error.stack || error);
    res.status(error.code || 500).json({
      message: error.message || error,
      success: false
    });
  }
};
function getFilterOptions(currentUserId: ObjectId) {
  return {
    spaces: { $in: ['$$spaces._id', accessPermissionsCache.get(currentUserId.toString()).map((ap) => ap.space)] }
  };
}
export const sendMaintainersWithPaginationToClient = async (req: RequestCustom, res: Response) => {
  try {
    const fieldFilterOptions = getFilterOptions(req.user._id);
    const maintainers = await Maintainer.find({ fieldFilterOptions });

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: maintainers,
      totalDocuments: maintainers.length
    });
  } catch (err) {
    logger.error(err.stack || err);
    res.status(err.code || 500).json({
      message: err.message || err
    });
  }
};

export const sendMaintainersToClient = async (req: RequestCustom, res: Response) => {
  try {
    const matchStage = req.user.isSuperAdmin ? {} : { 'userRegistry.isPublic': true };

    const maintainers = await Maintainer.find({ matchStage });
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: maintainers,
      totalDocuments: maintainers.length
    });
  } catch (err) {
    logger.error(err.stack || err);
    res.status(err.code || 500).json({
      message: err.message || err
    });
  }
};

export const sendMaintainersOfBuildingToClient = async (req: RequestCustom, res: Response) => {
  try {
    // const maintainer = await Maintainer.findOne({ matchStage: { _id: req.params.idMongoose } });
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity
      // data: maintainer
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendSingleMaintainerBySlug = async (req: RequestCustom, res: Response) => {
  try {
    req.params.entity = entity;
    const fieldFilterOptions = getFilterOptions(req.user._id);

    const data = await Maintainer.findOne({
      matchStage: {
        slug: req.params.slug
      },
      fieldFilterOptions
    });

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data
    });
  } catch (err) {
    logger.error(err.stack || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: err.message || err
    });
  }
};

export async function updateMaintainerById(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const entity = 'maintainers';
    const foundModel = await AccessPermission.create(idMongoose);

    foundModel.set(req.body);

    const updatedModel = await foundModel.save();

    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.OBJ_UPDATED,
      collection: entity,
      data: updatedModel,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
}

export async function addSpacesToMaintainer(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const { spaces } = req.body;

    for (const space of spaces) {
      await AccessPermission.create({ user: idMongoose, space, role: roleCache.get('Maintainer')._id }).catch((error) => {
        logger.error(error.message || error);
      });
    }
    const filter = getFilterOptions(req.user._id);
    const maintainer = await Maintainer.findOne({ matchStage: { _id: new ObjectId(idMongoose) }, fieldFilterOptions: filter });

    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.OBJ_UPDATED,
      collection: entity,
      data: maintainer,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
}

// ADD MAINTAINER TO SPACE
export async function favoriteMaintainerToSpaceAndSendToClient(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const { space } = req.body;
    const foundAP = await AccessPermission.findOne({
      role: RoleCache.maintainer._id,
      space
    });

    if (foundAP) {
      foundAP.disabled = false;
      await foundAP.save();
    } else {
      await AccessPermission.create({ user: idMongoose, space, role: roleCache.get('Maintainer')._id }).catch((error) => {
        logger.error(error.message || error);
      });
    }

    const filter = getFilterOptions(req.user._id);
    const maintainer = await Maintainer.findOne({ matchStage: { _id: new ObjectId(idMongoose) }, fieldFilterOptions: filter });

    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.OBJ_UPDATED,
      collection: entity,
      data: maintainer,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
}

// REMOVE MAINTAINER FROM SPACE
export async function removeMaintainerFromSpaceAndSendToClient(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const { space } = req.body;
    const foundAP = await AccessPermission.findOne({
      role: RoleCache.maintainer._id,
      space
    });

    if (foundAP) {
      foundAP.disabled = true;
      await foundAP.save();
    }
    const filter = getFilterOptions(req.user._id);
    const maintainer = await Maintainer.findOne({ matchStage: { _id: new ObjectId(idMongoose) }, fieldFilterOptions: filter });

    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.OBJ_UPDATED,
      collection: entity,
      data: maintainer,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
}

//! TODO: from next chose to call generic parameter route
export const removeSpaceFromMaintainerById = async (req: RequestCustom, res: Response) => {
  try {
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      // data: foundMaintainer,
      message: _MSG.OBJ_UPDATED
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export async function getFilteredMaintainerSpaces({ currentUser, maintainerId }: { currentUser: ReqUser; maintainerId: string }) {
  try {
    const userSpaces = accessPermissionsCache.get(currentUser._id.toString()).map((ap) => ap.space);
    const spaces = await AccessPermission.find({
      user: maintainerId,
      role: roleCache.get('Maintainer')._id,
      space: { $in: userSpaces }
    });
    return spaces;
  } catch (err) {
    logger.error(err.message || err);
    throw new Error(err.message || err);
  }
}

export async function getMaintainerAssignedSpaces(maintainerId: string) {
  try {
    const spaces = await AccessPermission.find({ user: maintainerId, role: roleCache.get('Maintainer')._id });
    return spaces;
  } catch (err) {
    logger.error(err.message || err);
    throw new Error(err.message || err);
  }
}
