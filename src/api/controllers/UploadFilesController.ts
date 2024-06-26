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
  deleteFileFromStorage,
  getFolderName,
  getFileDirName
} from '../helpers/uploadFileHelper';

import httpStatus from 'http-status';
import Upload from '../../models/Upload';
import logger from '../../lib/logger';
// import vars from '../../config/vars';
import { Request, Response } from 'express';
import { RequestCustom } from '../../types/custom-express/express-custom';
import mongoose from 'mongoose';
import { UploadResponseObject } from '../helpers/types-uploadFileHelper';
import vars from '../../utils/globalVariables';
import { ErrorCustom } from '../../lib/ErrorCustom';
// const { storageBucketName } = vars;

export async function getResourceFromStorage(req: Request, res: Response) {
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
}

export async function postResourceIntoStorage(req: RequestCustom, res: Response) {
  try {
    // const { forSingleField } = req.body;
    console.log('postResourceIntoStorage called', req.method, req.url, req.headers);

    const [filesToUpload /* existingFilesId */] = separateFiles(req.files);
    const generalDirName = await getFileDirName(req);

    const uploadModelsData = await saveInStorage(filesToUpload, generalDirName);
    // // ok, with reference of existing files
    const responseObj: UploadResponseObject = {};
    for (const key in uploadModelsData) {
      console.log(uploadModelsData[key]);
      const createdModel = await Upload.create({
        ...uploadModelsData[key],
        url: vars.storageUrl + '/' + uploadModelsData[key].fullPath,
        uploadedBy: req.user?._id
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
}
export async function deleteFileFromStorageAndEntity(req: RequestCustom, res: Response) {
  try {
    const { modelEntity, modelId, uploadKey, uploadId } = req.params;

    const uploadModel = await Upload.findById(uploadId);
    if (!uploadModel) {
      throw new ErrorCustom('File not found', 404);
    }
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
}

export async function postMaintenanceFileToStorage(req: RequestCustom, res: Response) {
  try {
    const folderName = getFolderName(req.body);
    const [filesToUpload /* existingFilesId */] = separateFiles(req.files);
    if (!filesToUpload) {
      throw new Error('No files to upload');
    }
    const uploadModelsData = await saveInStorage(filesToUpload, folderName, true);
    // ok, with reference of existing files
    const bulkUploads = uploadModelsData.map((uploadModelData) => {
      return {
        ...uploadModelData,
        url: vars.storageUrl + '/' + uploadModelData.fullPath,
        ACL: 'private'
      };
    });
    const createdUploads = await Upload.insertMany(bulkUploads);
    // for (const key in uploadModelsData) {
    //   const createdModel = await Upload.create({
    //     ...uploadModelsData[key],
    //     url: vars.storageUrl + '/' + uploadModelsData[key].fullPath,
    //     ACL: 'private'
    //     // uploadedBy: req.user._id
    //   });

    // if (responseObj[createdModel.fieldInParent]) {
    //   responseObj[createdModel.fieldInParent].push(createdModel._id.toString());
    // } else {
    //   responseObj[createdModel.fieldInParent] = [createdModel._id.toString()];
    // }
    // }
    const ids = createdUploads.map((createdModel) => createdModel._id);
    res.status(httpStatus.OK).json({
      success: true,
      data: ids,
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

export async function deleteAll(_req: RequestCustom, res: Response) {
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

export async function getAllUploads(_req: RequestCustom, res: Response) {
  try {
    const uploads = await Upload.find();

    const newU = uploads.map(async (upload) => {
      const url = await getPrivateUrlOfSpace({ params: { key: upload.fullPath } });
      return { ...upload.toObject(), url };
    });
    const newUploads = await Promise.all(newU);

    res.status(httpStatus.OK).json({
      success: true,
      data: newUploads,
      collection: 'storage',
      totalDocuments: uploads.length
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
