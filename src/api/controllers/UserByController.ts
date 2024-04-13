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
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { accessPermissionsCache } from '../../lib/mongoose/mongoose-cache/access-permission-cache';
import { ObjectId } from 'bson';
import { UserByUserType } from '../../models/util-models/user-by-user-type/UserByUserType';
const entity = 'users';

export const createUserByUserType = async (req: RequestCustom, res: Response) => {
  try {
    const foundUserByUserType = await UserByUserType[req.params.userType].findOne({ matchStage: { email: req.body.email } });
    if (foundUserByUserType) {
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

export const addUserByUserTypeToSpace = async (req: RequestCustom, res: Response) => {
  try {
    const foundUserByUserType = await User.findById(req.params.idUserByUserType);
    const space = await Space.findById(req.params.idSpace);
    const foundPermission = await AccessPermission.findOne({ user: foundUserByUserType, space });
    if (foundPermission) {
      throw new ErrorCustom(_MSG.MAINTAINER_EXISTS, httpStatus.CONFLICT);
    }
    await AccessPermission.create({
      user: foundUserByUserType,
      space,
      role: roleCache.get('maintainer')._id
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      message: _MSG.OBJ_CREATED,
      data: foundUserByUserType
    });
  } catch (error) {
    console.error(error.stack || error);
    res.status(error.code || 500).json({
      message: error.message || error,
      success: false
    });
  }
};
/**
 * @description remove duplication of spaceIds using Set
 */
function getFilterOptions(currentUserId: ObjectId) {
  const cleanedSpaces = [...new Set(accessPermissionsCache.get(currentUserId.toString()).map((ap) => ap.space.toString()))].map(
    (s) => new ObjectId(s)
  );
  return {
    spaces: { $in: ['$$spaces._id', cleanedSpaces] }
  };
}
export const sendUserByUserTypesWithPaginationToClient = async (req: RequestCustom, res: Response) => {
  try {
    const fieldFilterOptions = getFilterOptions(req.user._id);
    const usersByUserType = await UserByUserType[req.params.userType].find({ fieldFilterOptions });
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: usersByUserType,
      totalDocuments: usersByUserType.length
    });
  } catch (err) {
    logger.error(err.stack || err);
    res.status(err.code || 500).json({
      message: err.message || err
    });
  }
};

export const sendUserByUserTypesToClient = async (req: RequestCustom, res: Response) => {
  try {
    const matchStage = req.user.isSuperAdmin ? {} : { 'userRegistry.isPublic': true };

    const userByUserType = await UserByUserType[req.params.userType].find({ matchStage });
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: userByUserType,
      totalDocuments: userByUserType.length
    });
  } catch (err) {
    logger.error(err.stack || err);
    res.status(err.code || 500).json({
      message: err.message || err
    });
  }
};

export const sendUserByUserTypesOfBuildingToClient = async (req: RequestCustom, res: Response) => {
  try {
    const userByUserType = await UserByUserType[req.params.userType].find({
      matchStage: {
        accessPermissions: { $elemMatch: { 'space._id': req.query.space } }
      }
    });
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: userByUserType
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendSingleUserByUserTypeBySlug = async (req: RequestCustom, res: Response) => {
  try {
    req.params.entity = entity;
    const fieldFilterOptions = getFilterOptions(req.user._id);

    const data = await UserByUserType[req.params.userType].findOne({
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

export async function updateUserByUserTypeById(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const entity = 'userByUserType';
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

export async function addSpacesToUserByUserType(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const { spaces } = req.body;

    for (const space of spaces) {
      await AccessPermission.create({ user: idMongoose, space, role: roleCache.get('maintainer')._id }).catch((error) => {
        logger.error(error.message || error);
      });
    }
    const filter = getFilterOptions(req.user._id);
    const maintainer = await UserByUserType[req.params.userType].findOne({
      matchStage: { _id: new ObjectId(idMongoose) },
      fieldFilterOptions: filter
    });

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
export async function favoriteUserByUserTypeToSpaceAndSendToClient(req: RequestCustom, res: Response) {
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
      await AccessPermission.create({ user: idMongoose, space, role: roleCache.get('maintainer')._id }).catch((error) => {
        logger.error(error.message || error);
      });
    }

    const filter = getFilterOptions(req.user._id);
    const maintainer = await UserByUserType[req.params.userType].findOne({
      matchStage: { _id: new ObjectId(idMongoose) },
      fieldFilterOptions: filter
    });

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
export async function removeUserByUserTypeFromSpaceAndSendToClient(req: RequestCustom, res: Response) {
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
    const maintainer = await UserByUserType[req.params.userType].findOne({
      matchStage: { _id: new ObjectId(idMongoose) },
      fieldFilterOptions: filter
    });

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
export const removeSpaceFromUserByUserTypeById = async (req: RequestCustom, res: Response) => {
  try {
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      // data: foundUserByUserType,
      message: _MSG.OBJ_UPDATED
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export async function getFilteredUserByUserTypeSpaces({ currentUser, maintainerId }: { currentUser: ReqUser; maintainerId: string }) {
  try {
    const userSpaces = accessPermissionsCache.get(currentUser._id.toString()).map((ap) => ap.space);
    const spaces = await AccessPermission.find({
      user: maintainerId,
      role: roleCache.get('maintainer')._id,
      space: { $in: userSpaces }
    });
    return spaces;
  } catch (err) {
    logger.error(err.message || err);
    throw new Error(err.message || err);
  }
}

export async function getUserByUserTypeAssignedSpaces(maintainerId: string) {
  try {
    const spaces = await AccessPermission.find({ user: maintainerId, role: roleCache.get('maintainer')._id });
    return spaces;
  } catch (err) {
    logger.error(err.message || err);
    throw new Error(err.message || err);
  }
}
