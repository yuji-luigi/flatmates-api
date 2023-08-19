import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../config/logger';

import { _MSG } from '../../utils/messages';
import { MongooseBaseModel } from '../../types/mongoose-types/model-types/base-types/base-model-interface';
import AuthToken from '../../models/AuthToken';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { verifyPinFromRequest } from '../helpers/authTokenHelper';
import User from '../../models/User';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { sensitiveCookieOptions } from '../../config/vars';

const entity = 'authTokens';
//= ===============================================================================
// CRUD GENERIC CONTROLLER METHODS
//= ===============================================================================

export const sendAuthTokenByIdsToClient = async (req: Request, res: Response) => {
  try {
    const { linkId, idMongoose } = req.params;
    const data = await AuthToken.findOne<MongooseBaseModel>({
      linkId,
      _id: idMongoose
    });
    if (!data) {
      throw new Error('no data found');
    }
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data,
      totalDocuments: 1
    });
  } catch (err) {
    logger.error(_MSG.INVALID_ACCESS, err.message);
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const sendLinkIdToClient = async (req: Request, res: Response) => {
  try {
    const { idMongoose } = req.params;
    const data = await AuthToken.findById<AuthTokenInterface>(idMongoose);
    if (!data) {
      throw new Error('no data found');
    }
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: { linkId: data.linkId, _id: data._id },
      totalDocuments: 1
    });
  } catch (err) {
    logger.error(_MSG.INVALID_ACCESS, err.message);
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const verifyPinAndSendBooleanToClient = async (req: RequestCustom, res: Response) => {
  try {
    const verified = await verifyPinFromRequest(req);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: verified
    });
  } catch (err) {
    logger.error(_MSG.INVALID_ACCESS, err.message);
    res.status(err).json({
      message: err.message || err
    });
  }
};

export const verifyPinAndSendUserToClient = async (req: RequestCustom, res: Response) => {
  try {
    // throws error
    const verified = await verifyPinFromRequest(req);
    if (!verified) {
      throw new Error('pin not verified');
    }
    const user = await User.findOne({ authToken: req.params.idMongoose });
    res.cookie('jwt', user.token(), sensitiveCookieOptions);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: user
    });
  } catch (err) {
    logger.error(_MSG.INVALID_ACCESS, err.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: err.message || err
    });
  }
};
