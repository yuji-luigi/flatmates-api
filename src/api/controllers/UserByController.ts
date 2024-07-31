import httpStatus from 'http-status';
import logger from '../../lib/logger';
import { NextFunction, Response } from 'express';
import { ParamsInterface, RequestCustom as RequestCustomRoot } from '../../types/custom-express/express-custom';
import { _MSG } from '../../utils/messages';
import Space from '../../models/Space';
import { RoleCache, roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import User from '../../models/User';
import AccessPermission from '../../models/AccessPermission';
import { ErrorCustom } from '../../lib/ErrorCustom';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { accessPermissionsCache } from '../../lib/mongoose/mongoose-cache/access-permission-cache';
import { ObjectId } from 'mongodb';
import { UserByUserType } from '../../models/util-models/user-by-user-type/UserByUserType';
import Invitation from '../../models/Invitation';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
import { Error } from 'mongoose';
import { convertExcelToJson } from '../../utils/excel/excelHelper';
import { handleImportFlatmates } from '../../utils/excel/import-flatmates/importFlatmatesUnits';
import { UserImportExcel } from '../../types/excel/UserImportExcel';
import { updateExpiredOrPendingInvitationsOfCurrentSpaceToBeExpired } from '../helpers/invitation-helpers';
const entity = 'users';

interface RequestCustom extends RequestCustomRoot {
  user: ReqUser;
  params: ParamsInterface & { userType: RoleName };
}
export const createUserByUserType = async (req: RequestCustom, res: Response) => {
  try {
    if (!req.params.userType) throw new Error('User type is required');
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
      role: roleCache.get('maintainer')?._id
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
const getUserSpaceIds = (currentUserId: ObjectId) =>
  [...new Set(accessPermissionsCache.get(currentUserId.toString())?.map((ap) => ap.space.toString()))].map((s) => new ObjectId(s));

/**
 * @description this pipeline filter out all the spaces that does not associated with the current user.
 */
function getFilterOptionsAllSpacesOfUser(currentUserId: ObjectId) {
  const cleanedSpaces = getUserSpaceIds(currentUserId);
  return {
    spaces: { $in: ['$$spaces._id', cleanedSpaces] }
  };
}

function getFilterOptionsCurrentSpace(currentSpaceId: ObjectId | undefined) {
  if (!currentSpaceId) throw new ErrorCustom('Select the space first to get the users of the space', httpStatus.UNAUTHORIZED);
  return {
    spaces: { $in: ['$$spaces._id', [currentSpaceId]] }
  };
}

export const sendUserByUserTypesWithPaginationToClient = async (req: RequestCustom & { user: ReqUser }, res: Response) => {
  try {
    if (!req.params.userType) {
      throw new ErrorCustom('User type is required', 401);
    }
    const fieldFilterOptions = getFilterOptionsCurrentSpace(req.user.currentSpace?._id);
    const usersByUserType = await UserByUserType[req.params.userType].find({
      fieldFilterOptions,
      additionalPipelines: [{ $match: { spaces: { $ne: [] } } }]
    });
    const pendingInvites = await Invitation.aggregate([
      {
        $match: {
          status: 'pending',
          userType: req.params.userType,
          space: new ObjectId(req.user.currentSpace?._id)
        }
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unit',
          foreignField: '_id',
          as: 'unitDetails'
        }
      },
      {
        $addFields: {
          name: {
            $cond: {
              if: { $gt: [{ $size: '$unitDetails' }, 0] }, // Check if unitDetails array is not empty
              then: { $arrayElemAt: ['$unitDetails.ownerName', 0] }, // Use the name of the unit
              else: '' // Default name if no unit is referenced
            }
          },
          surname: 'Pending Invitation'
        }
      },
      {
        $project: {
          _id: 0,
          email: 1,
          active: 1,
          tel: 1,
          name: 1,
          status: 1
        }
      }
    ]);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: usersByUserType.concat(pendingInvites),
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
    const fieldFilterOptions = getFilterOptionsCurrentSpace(req.user.currentSpace?._id);

    const userByUserType = await UserByUserType[req.params.userType].find({
      matchStage,
      fieldFilterOptions,
      additionalPipelines: [{ $match: { spaces: { $ne: [] } } }]
    });

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
    const fieldFilterOptions = getFilterOptionsAllSpacesOfUser(req.user._id);

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
      await AccessPermission.create({ user: idMongoose, space, role: roleCache.get('maintainer')?._id }).catch((error) => {
        logger.error(error.message || error);
      });
    }
    const filter = getFilterOptionsAllSpacesOfUser(req.user._id);
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
      await AccessPermission.create({ user: idMongoose, space, role: roleCache.get('maintainer')?._id }).catch((error) => {
        logger.error(error.message || error);
      });
    }

    const filter = getFilterOptionsAllSpacesOfUser(req.user._id);
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
export async function removeUserByUserTypeFromSpaceAndSendToClient(req: RequestCustom & { user: ReqUser }, res: Response) {
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
    const filter = getFilterOptionsAllSpacesOfUser(req.user._id);
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
export const removeSpaceFromUserByUserTypeById = async (_req: RequestCustom, res: Response) => {
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
    const userSpaces = accessPermissionsCache.get(currentUser._id.toString())?.map((ap) => ap.space);
    const spaces = await AccessPermission.find({
      user: maintainerId,
      role: roleCache.get('maintainer')?._id,
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
    const spaces = await AccessPermission.find({ user: maintainerId, role: roleCache.get('maintainer')?._id });
    return spaces;
  } catch (err) {
    logger.error(err.message || err);
    throw new Error(err.message || err);
  }
}

export async function importFlatmatesFromClient(req: RequestCustom, res: Response, next: NextFunction) {
  try {
    const { currentSpace } = req.user;
    if (!currentSpace) throw new ErrorCustom('Select the space first to get the users of the space', httpStatus.UNAUTHORIZED);

    if (!req.files?.file) {
      throw new ErrorCustom('No excel or file detected', httpStatus.BAD_REQUEST);
    }
    const data = convertExcelToJson<UserImportExcel>(req.files.file);
    await updateExpiredOrPendingInvitationsOfCurrentSpaceToBeExpired(currentSpace._id);
    const units = await handleImportFlatmates({ excelData: data, currentSpace, createdBy: req.user._id });

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: units
    });
  } catch (error) {
    logger.error(error.stack || error);
    next(error);
    // res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
}
