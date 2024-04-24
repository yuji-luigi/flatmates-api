import { Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../lib/logger';

import { deleteEmptyFields } from '../../utils/functions';
import { RequestCustom, RequestWithFiles } from '../../types/custom-express/express-custom';
import Check from '../../models/Check';
import Maintenance from '../../models/Maintenance';
import AuthToken from '../../models/AuthToken';
import { getOCRSpaceText } from '../../lib/ocr-space/initOcr';
import fs from 'node:fs/promises';
import path from 'node:path';
import { assetsDir } from '../../utils/globalVariables';
import { UploadedFile } from 'express-fileupload';
const entity = 'checks';

export const createCheck = async (req: RequestCustom, res: Response) => {
  try {
    // get req.params.entity

    req.body = deleteEmptyFields(req.body);
    const newCheck = new Check(req.body);
    await newCheck.save();
    // const files = await Upload.find({ _id: { $in: newCheck.files } });
    // for (const file of files) {
    //   const filePath = await file.getUrl();
    //   const text = await getOCRSpaceText(filePath);
    //   // call AI to get the json.
    // }

    //! Todo: handle this in frontend.
    // return sendCrudObjectsWithPaginationToClient(req, res);

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      data: newCheck,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};
const PATH = path.join(assetsDir, 'private');

export const getMaintenanceCheckDataWithOCR = async (req: RequestWithFiles, res: Response) => {
  try {
    await fs.access(PATH).catch(async () => {
      await fs.mkdir(PATH);
    });
    const texts = [];
    for (const key in req.files) {
      const file = req.files[key] as UploadedFile;
      const filePath = `${PATH}/${file.name}`;
      await fs.writeFile(filePath, file.data);
      // get the text from the file b ocr.
      const text = await getOCRSpaceText(filePath);
      texts.push(text);
      // generate json by AI only total

      // sum them up
    }

    // delete the file(or if I want to use it for saving to spaces DO then response back the file name to client.)
    // deleting example
    for (const key in req.files) {
      const file = req.files[key] as UploadedFile;
      const filePath = `${PATH}/${file.name}`;
      await fs.unlink(filePath);
    }
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: texts,
      count: 1
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
};

export async function sendCheckToClient(req: RequestCustom, res: Response) {
  try {
    const check = await Check.findById(req.params.idMongoose);

    const maintenance = await Maintenance.findOne({ _id: check.parent._id });
    const foundAuthToken = await AuthToken.findOne({ 'docHolder.instanceId': maintenance._id, nonce: req.cookies.maintenanceNonce });
    // const nonceIsCorrect = +req.cookies.maintenanceNonce === authToken.nonce;

    if (!foundAuthToken) throw new Error('nonce is not correct');
    const promises = check.files.map(async (file) => {
      await file.setUrl();
    });
    await Promise.all(promises);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: check,
      count: 1
    });
  } catch (err) {
    logger.error(err);
    res.status(err).json({
      message: err.message || err
    });
  }
}

export async function showCheckToClient(req: RequestCustom, res: Response) {
  try {
    const check = await Check.findById(req.params.idMongoose);
    const promises = check.files.map(async (file) => {
      await file.setUrl();
    });
    await Promise.all(promises);
    res.status(httpStatus.OK).json({
      data: check,
      success: true,
      collection: 'checks'
    });
  } catch (error) {
    logger.error();
  }
}

export async function verifyNonceCookieSendChecksMaintenanceToClient(req: RequestCustom, res: Response) {
  try {
    const authToken = await AuthToken.findOne({ linkId: req.params.linkId, nonce: req.cookies.maintenanceNonce });
    if (!authToken) throw new Error('nonce is not correct. Please check email and set the 6 digits code again.');

    const check = await Check.findById(req.params.idMongoose);
    const promises = check.files.map(async (file) => {
      await file.setUrl();
    });
    // const maintenance = await Maintenance.findById(authToken.docHolder.instanceId);
    await Promise.all(promises);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: { check /* maintenance */ },
      count: 1
    });
  } catch (err) {
    logger.error(err);
    res.status(err).json({
      message: err.message || err
    });
  }
}

export async function getChecksByMaintenanceId(req: RequestCustom, res: Response) {
  try {
    const { idMongoose } = req.params;
    const maintenance = await Maintenance.findOne({
      _id: idMongoose,
      ...req.query
    });
    if (!maintenance) throw new Error('maintenance not found');
    const checks = await Check.find({ maintenance: idMongoose });
    for (const check of checks) {
      const promises = check.files.map(async (file) => {
        await file.setUrl();
      });
      await Promise.all(promises);
    }

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: { checks, maintenance },
      count: 1
    });
  } catch (err) {
    logger.error(err);
    res.status(err).json({
      message: err.message || err
    });
  }
}
