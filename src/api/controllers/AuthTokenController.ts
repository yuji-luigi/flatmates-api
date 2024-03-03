import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../lib/logger';

import { _MSG } from '../../utils/messages';
import AuthToken from '../../models/AuthToken';
import { stringifyAuthToken, typeGuardAuthTokenSpaceOrg, verifyPinFromRequest } from '../helpers/authTokenHelper';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { sensitiveCookieOptions } from '../../utils/globalVariables';
import { signJwt } from '../../lib/jwt/jwtUtils';
import { JwtSignPayload } from '../../lib/jwt/jwtTypings';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';

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

// for onboarding
export const verifyPinAndSendUserToClient = async (req: RequestCustom, res: Response) => {
  try {
    // verified is when authToken is found. so this is not necessary variable now.
    const { authToken } = await verifyPinFromRequest(req);
    // case 1: pin not verified

    if (!typeGuardAuthTokenSpaceOrg(authToken)) return;

    // const user = await User.findById(authToken.docHolder.instanceId).lean();
    // const space = await Space.findById(authToken.space._id).lean().populate({ path: 'cover', select: 'url' });
    const jwtObj: JwtSignPayload = {
      email: '',
      loggedAs: 'Inhabitant'
    };
    const jwt = signJwt(jwtObj);

    res.cookie('jwt', jwt, sensitiveCookieOptions);

    const stringifiedAuthToken = stringifyAuthToken(authToken);
    res.cookie('auth-token', stringifiedAuthToken, sensitiveCookieOptions);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity
      // data: user
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

export async function generateNewAuthTokenForEntity(req: RequestCustom, res: Response) {
  try {
    const foundAuthTokens = await AuthToken.find({
      docHolder: {
        instanceId: req.params.idMongoose,
        entity: req.params.entity
      }
    });
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: foundAuthTokens
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      collection: entity,
      message: error.message || error
    });
  }
}
