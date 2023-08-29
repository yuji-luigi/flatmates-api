import mongoose from 'mongoose';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../config/logger';

import MSG, { _MSG } from '../../utils/messages';
import { cutQuery, deleteEmptyFields, getEntity, getEntityFromOriginalUrl, getSplittedPath } from '../../utils/functions';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { MongooseBaseModel } from '../../types/mongoose-types/model-types/base-types/base-model-interface';
import { IUpload } from '../../types/mongoose-types/model-types/upload-interface';
//= ===============================================================================
// CRUD GENERIC CONTROLLER METHODS
//= ===============================================================================

export const getPublicCrudObjects = async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity || getSplittedPath(cutQuery(req.url))[2];
    req.params.entity = entity;

    const Model = mongoose.model(entity);
    const data = await Model.find<MongooseBaseModel>(req.query).sort({
      createdAt: -1
    });

    if (data.length) {
      if (data[0].setStorageUrlToModel) {
        for (const item of data) {
          await item.setStorageUrlToModel();
        }
      }
    }

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data,
      totalDocuments: data.length
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendCrudDocumentsToClient = async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity || getSplittedPath(cutQuery(req.url))[2];
    // req.params.entity = entity;

    const Model = mongoose.model(entity);

    const data = await Model.find<MongooseBaseModel>(req.query)
      .sort({
        createdAt: -1
      })
      .lean();

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data,
      totalDocuments: data.length
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendCrudObjectToLoggedClient = async (req: RequestCustom, res: Response) => {
  try {
    if (!req.user) {
      throw new Error(_MSG.NOT_AUTHORIZED);
    }
    const entity = req.params.entity || getEntityFromOriginalUrl(req.originalUrl);
    req.params.entity = entity;

    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    const Model = mongoose.model(entity);

    const data = await Model.find(req.query);

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data,
      totalDocuments: data.length
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const getSingleCrudObject = async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity || getEntity(req.url);
    req.params.entity = entity;
    const data: Record<string, object | string | Date | number | IUpload> = await mongoose.model(entity).findById(req.params.idMongoose);
    data.avatar && (await (data.avatar as IUpload).setUrl());
    data.cover && (await (data.cover as IUpload).setUrl());
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data,
      count: data.length
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: err.message || err
    });
  }
};

export const createCrudObject = async (req: RequestCustom, res: Response) => {
  try {
    // get req.params.entity
    const entity = req.params.entity || getEntity(req.url);
    req.body = deleteEmptyFields(req.body);
    req.body.user = req.user._id;
    const Model = mongoose.model(entity);
    const newModel = new Model(req.body);
    await newModel.save();
    //! Todo: handle this in frontend.
    // return sendCrudObjectsWithPaginationToClient(req, res);

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      data: newModel,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

// update is universal. API response back without pagination. always res back with updated object.
export const updateCrudObjectById = async (req: Request, res: Response) => {
  try {
    const { idMongoose } = req.params;
    const entity = req.params.entity || getEntity(req.url);
    const foundModel = await mongoose.model(entity).findById(idMongoose);

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
};

/**
 * TODO: response new 10 data array of that page
 * Need to know: "pageNumber", "skip", like normal get route.
 */
export const deleteCrudObjectById = async (req: Request, res: Response) => {
  try {
    const { idMongoose } = req.params;
    const entity: string = req.params.entity || getEntityFromOriginalUrl(req.originalUrl);
    const { deletedCount } = await mongoose.model(entity).deleteOne({ _id: idMongoose });
    if (deletedCount === 0) {
      return res.status(httpStatus.NO_CONTENT).json({
        success: false,
        message: MSG({ entity, id: idMongoose }).OBJ_NOT_FOUND,
        collection: entity,
        count: deletedCount
      });
    }
    /** pass to sendCrudObjectsWithPaginationToClient to send the updated (deleted array) */
    // return sendCrudObjectsWithPaginationToClient(req, res);

    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.OBJ_DELETED,
      data: { documentId: idMongoose },
      deletedCount,
      collection: entity,
      count: deletedCount
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export default {
  // sendCrudObjectsWithPaginationToClient,
  sendCrudDocumentsToClient,
  createCrudObject,
  deleteCrudObjectById,
  updateCrudObjectById,
  getSingleCrudObject
};

export const sendNotImplemented = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_IMPLEMENTED).json({
    message: _MSG.NOT_IMPLEMENTED
  });
};
