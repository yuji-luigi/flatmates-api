import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../config/logger';

import { _MSG } from '../../utils/messages';
import AuthToken from '../../models/AuthToken';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { stringifyAuthToken, verifyPinFromRequest } from '../helpers/authTokenHelper';
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
    const data = await AuthToken.findOne({
      linkId,
      _id: idMongoose
    });
    if (!data) {
      throw new Error('no data found');
    }
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: { linkId: data.linkId },
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
      throw new Error(_MSG.OBJ_NOT_FOUND);
    }
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: { linkId: data.linkId, _id: data._id, active: data.active },
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
    const { verified } = await verifyPinFromRequest(req);
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
    const { verified, authToken } = await verifyPinFromRequest(req);
    // case 1: pin not verified
    if (!verified) {
      throw new Error('pin not verified');
    }
    const user = await User.findById(authToken.docHolder.instanceId);
    res.cookie('jwt', user.token(), sensitiveCookieOptions);
    const stringifiedAuthToken = stringifyAuthToken(authToken);
    res.cookie('auth-token', stringifiedAuthToken, sensitiveCookieOptions);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: user
    });
  } catch (err) {
    logger.error(_MSG.INVALID_ACCESS, err.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      details: err.message || err,
      message: _MSG.ERRORS.GENERIC,
      success: false
    });
  }
};
