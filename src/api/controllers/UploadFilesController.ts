/**
 * *************************************
 *  SHADAPPS CONFIDENTIAL
 *  __________________
 *
 *  Created by Vittorio Tauro
 *
 *  2021 (c) ShadApps Srl
 *  All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of ShadApps Srl and its suppliers,
 *  if any. The intellectual and technical concepts contained
 *  herein are proprietary to ShadApps Srl.
 *  and its suppliers and may be covered by Italian, European and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from ShadApps Srl.
 * *************************************
 * */

// const AWS = require('aws-sdk')

// import { writeFileSync } from 'fs';

import {
  // s3Client as s3,
  // streamToString,
  saveInStorage,
  getPrivateUrlOfSpace,
  separateFiles,
  createFilesDirName,
  deleteFileFromStorage
} from '../helpers/uploadFileHelper';

import httpStatus from 'http-status';
import Upload from '../../models/Upload';
import logger from '../../config/logger';
// import vars from '../../config/vars';
import { Request, Response } from 'express';
import { RequestCustom } from '../../types/custom-express/express-custom';
import mongoose from 'mongoose';
import { UploadResponseObject } from '../helpers/types-uploadFileHelper';
import { replaceSpecialChars } from '../../utils/functions';
// const { storageBucketName } = vars;

const uploadFilesController = {
  async getResourceFromStorage(req: Request, res: Response) {
    try {
      const url = await getPrivateUrlOfSpace(req);
      res.send(url);
    } catch (error) {
      logger.error(error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        collection: 'storage',
        message: `getResourceFromStorage function. Error:${error.message || error}`
      });
    }
  },

  async postResourceIntoStorage(req: RequestCustom, res: Response) {
    try {
      // const { forSingleField } = req.body;
      const [filesToUpload /* existingFilesId */] = separateFiles(req.files);
      const folderName = `${replaceSpecialChars(req.space.name)}/${req.params.entity}`;
      const generalDirName = await createFilesDirName(req.user, folderName);

      const uploadModelsData = await saveInStorage(filesToUpload, generalDirName);
      // ok, with reference of existing files
      const responseObj: UploadResponseObject = {};
      for (const key in uploadModelsData) {
        const createdModel = await Upload.create({
          ...uploadModelsData[key],
          uploadedBy: req.user._id
        });

        if (responseObj[createdModel.fieldInParent]) {
          responseObj[createdModel.fieldInParent].push(createdModel._id.toString());
        } else {
          responseObj[createdModel.fieldInParent] = [createdModel._id.toString()];
        }
      }
      res.status(httpStatus.OK).json({
        success: true,
        data: responseObj,
        collection: 'storage'
      });
    } catch (error) {
      logger.error(error.message || error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        success: false,
        collection: 'storage'
      });
    }
  },
  async deleteFileFromStorageAndEntity(req: RequestCustom, res: Response) {
    try {
      const { modelEntity, modelId, uploadKey, uploadId } = req.params;

      const uploadModel = await Upload.findById(uploadId);
      deleteFileFromStorage(uploadModel.fullPath);
      await uploadModel.removeThis();
      const rootModel = await mongoose.model(modelEntity).findById(modelId);
      const updatedFilesInModel = rootModel[uploadKey].filter(
        (file: any) => file._id.toString() !== uploadId // file._id is an ObjectId
      );
      rootModel[uploadKey] = updatedFilesInModel;
      await rootModel.save();

      res.status(httpStatus.OK).json({
        success: true,
        data: /* forSingleField ? uploadModelIds[0] : */ '',
        collection: 'storage'
      });
    } catch (error) {
      logger.error(error.message || error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        success: false,
        collection: 'storage'
      });
    }
  },
  async deleteAll(req: RequestCustom, res: Response) {
    try {
      const deletedModels = await Upload.find();
      for (const key in deletedModels) {
        await deleteFileFromStorage(deletedModels[key].fullPath);
      }
      const deletedResult = await Upload.deleteMany();
      logger.info('\n\nAll files deleted from storage\n\n');
      logger.info(`\n\n${JSON.stringify(deletedResult, null, 4)}\n\n`);
      res.status(httpStatus.OK).json({
        success: true,
        data: deletedModels,
        collection: 'storage'
      });
    } catch (error) {
      logger.error(error.message || error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        success: false,
        collection: 'storage'
      });
    }
  }
};

export default uploadFilesController;
