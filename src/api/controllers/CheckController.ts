import { Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../config/logger';

import { deleteEmptyFields } from '../../utils/functions';
import { RequestCustom } from '../../types/custom-express/express-custom';
import Check from '../../models/Check';
import Maintenance from '../../models/Maintenance';
const entity = 'checks';

export const createCheck = async (req: RequestCustom, res: Response) => {
  try {
    // get req.params.entity

    req.body = deleteEmptyFields(req.body);
    const newCheck = new Check(req.body);
    await newCheck.save();

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

export async function sendCheckToClient(req: RequestCustom, res: Response) {
  try {
    const check = await Check.findById(req.params.idMongoose);

    const maintenance = await Maintenance.findOne({ [check.type]: { $in: [req.params.idMongoose] } });

    const nonceIsCorrect = +req.cookies.maintenanceNonce === maintenance.nonce;
    if (!nonceIsCorrect) throw new Error('nonce is not correct');
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
    const maintenance = await Maintenance.findOne({ linkId: req.params.linkId, nonce: req.cookies.maintenanceNonce });
    if (!maintenance) throw new Error('nonce is not correct. Please check email and set the 6 digits code again.');

    const check = await Check.findById(req.params.idMongoose);
    const promises = check.files.map(async (file) => {
      await file.setUrl();
    });
    await Promise.all(promises);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: { check, maintenance },
      count: 1
    });
  } catch (err) {
    logger.error(err);
    res.status(err).json({
      message: err.message || err
    });
  }
}
