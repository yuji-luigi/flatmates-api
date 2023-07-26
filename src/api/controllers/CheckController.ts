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
    req.body.type = req.params.checkType;
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
    await check.file.setUrl();
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

exports.showCheckToClient = async function (req: RequestCustom, res: Response) {
  try {
    const check = await Check.findById(req.params.idMongoose);
    await check.file.setUrl();
    res.status(httpStatus.OK).json({
      data: check,
      success: true,
      collection: 'checks'
    });
  } catch (error) {
    logger.error();
  }
};
