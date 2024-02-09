import Maintainer from '../../models/Maintainer';
import httpStatus from 'http-status';
import logger from '../../lib/logger';
import { Response } from 'express';
import { deleteEmptyFields } from '../../utils/functions';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { _MSG } from '../../utils/messages';
import Organization from '../../models/Organization';
import Space from '../../models/Space';
import { MaintainerInterface } from '../../types/mongoose-types/model-types/maintainer-interface';
import { IUpload } from '../../types/mongoose-types/model-types/upload-interface';

const entity = 'maintainers';

export const createMaintainer = async (req: RequestCustom, res: Response) => {
  try {
    const foundMaintainer = await Maintainer.findOne({ email: req.body.email });
    if (foundMaintainer) {
      throw new Error(_MSG.MAINTAINER_EXISTS);
    }

    req.body.createdBy = req.user;
    const reqBody = deleteEmptyFields<MaintainerInterface>(req.body);
    const newMaintainer = new Maintainer(reqBody);

    const organization = await Organization.findById(req.user.organizationId);
    if (organization) {
      organization.maintainers.push(newMaintainer);
      await organization.save();
    }

    const space = await Space.findById(req.user.spaceId).lean();
    if (space) {
      newMaintainer.rootSpaces.push(space._id);
      // space.maintainers.push(newMaintainer);
      // await space.save();
    }
    await newMaintainer.save();
    const data = await Maintainer.find({ _id: { $in: organization.maintainers } });

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      data,
      count: data.length
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};

export const sendMaintainersWithPaginationToClient = async (req: RequestCustom, res: Response) => {
  try {
    // const queryMaintainer = req.user.spaceId?.maintainers || req.organization?.maintainers;

    const maintainers = await Maintainer.find();
    // const maintainers = await Maintainer.find({ _id: { $in: queryMaintainer } });

    for (const maintainer of maintainers) {
      typeof maintainer.avatar === 'object' && (await maintainer.avatar.setUrl());
      typeof maintainer.cover === 'object' && (await maintainer.cover.setUrl());

      if (maintainer.rootSpaces.includes(req.cookies.spaceId)) {
        // maintainer.isInSpace = true;
      }
    }

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: maintainers,
      totalDocuments: maintainers.length
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendMaintainersOfBuildingToClient = async (req: RequestCustom, res: Response) => {
  try {
    // const queryMaintainer = req.user.spaceId?.maintainers || req.organization?.maintainers;

    const maintainers = await Maintainer.find({ spaces: { $in: [req.user.spaceId] } });
    // const maintainers = await Maintainer.find({ _id: { $in: queryMaintainer } });

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: maintainers,
      totalDocuments: maintainers.length
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendSingleMaintainerBySlug = async (req: RequestCustom, res: Response) => {
  try {
    const entity = 'maintainers';
    req.params.entity = entity;
    const data: Record<string, object | string | Date | number | IUpload> = await Maintainer.findOne({ slug: req.params.slug });
    data.avatar && (await (data.avatar as IUpload).setUrl());
    data.cover && (await (data.cover as IUpload).setUrl());
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data,
      count: data.length
    });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: err.message || err
    });
  }
};

export async function updateMaintainerById(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const entity = 'maintainers';
    const foundModel = await Maintainer.findById(idMongoose);

    foundModel.set(req.body);
    if (req.body.spaces?.length) {
      foundModel.rootSpaces.push(...req.body.spaces);
    }

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

//! TODO: from next chose to call generic parameter route
export const removeSpaceFromMaintainerById = async (req: RequestCustom, res: Response) => {
  try {
    /**
     * find model
     * create model with parentId in the correct field
     * save
     * send the data array to handle in redux
     */
    const { maintainer, space } = req.query;
    const foundMaintainer = await Maintainer.findById(maintainer);
    const deletedSpaces = foundMaintainer.rootSpaces.filter((_space) => _space.toString() !== space.toString()).map((_space) => _space);
    foundMaintainer.rootSpaces = deletedSpaces as any;
    await foundMaintainer.save();
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: foundMaintainer,
      message: _MSG.OBJ_UPDATED
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export default {
  createMaintainer,
  sendMaintainersWithPaginationToClient,
  updateMaintainerById,
  sendSingleMaintainerBySlug
};
