import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../lib/logger';

import { _MSG } from '../../utils/messages';
import AuthToken from '../../models/AuthToken';
import { stringifyAuthToken, typeGuardAuthTokenSpaceOrg, verifyAuthTokenByNonceAndLinkId, verifyPinFromRequest } from '../helpers/authTokenHelper';
import { RequestCustom, RequestCustomWithUser } from '../../types/custom-express/express-custom';
import { sensitiveCookieOptions } from '../../utils/globalVariables';
import { signJwt } from '../../lib/jwt/jwtUtils';
import { JwtSignPayload } from '../../lib/jwt/jwtTypings';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { ErrorCustom } from '../../lib/ErrorCustom';
import { generateNonceCode, generateRandomStringByLength, replaceSpecialChars } from '../../utils/functions';
import { AnyBulkWriteOperation } from 'mongodb';
import Invitation from '../../models/Invitation';
import Unit from '../../models/Unit';
import { checkUserPermissionOfSpace } from '../../middlewares/isLoggedIn';

const entity = 'authTokens';
//= ===============================================================================
// CRUD GENERIC CONTROLLER METHODS
//= ===============================================================================

export const sendQrCodeByEntityAndIdMongoose = async (req: Request, res: Response) => {
  try {
    const { entity, idMongoose } = req.params;
    const data = await AuthToken.findOne({
      entity,
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

// for checking the nonce is valid to linkId
export const verifyPinAndLinkId = async (req: RequestCustom, res: Response) => {
  try {
    // verified is when authToken is found. so this is not necessary variable now.

    const authToken = await verifyAuthTokenByNonceAndLinkId({ linkId: req.params.linkId, nonce: req.body.nonce });

    // case 1: pin not verified
    res.cookie('auth-token', stringifyAuthToken(authToken), sensitiveCookieOptions);

    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.SUCCESS,
      data: 'verified'
    });
  } catch (err) {
    logger.error(err.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: err.message || err,
      success: false
    });
  }
};

// for checking the nonce is valid to linkId
export const checkAuthTokenByCookie = async (req: RequestCustom, res: Response) => {
  try {
    // verified is when authToken is found. so this is not necessary variable now.
    const authTokenCookie = decodeURIComponent(req.cookies['auth-token']);
    const authTokenCookieObj = JSON.parse(authTokenCookie);
    const foundAuthToken = authTokenCookie ? await AuthToken.findOne(authTokenCookieObj) : null;
    if (!foundAuthToken) {
      throw new ErrorCustom(_MSG.INVALID_ACCESS, httpStatus.FORBIDDEN);
    }
    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.SUCCESS,
      data: 'verified'
    });
  } catch (err) {
    logger.error(err.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: err.message || err,
      success: false
    });
  }
};
// for checking the nonce is valid to linkId
export const confirmAuthTokenByTypeAndCookie = async (req: RequestCustom, res: Response) => {
  try {
    // verified is when authToken is found. so this is not necessary variable now.
    const authTokenCookie = decodeURIComponent(req.cookies['auth-token']);
    const authTokenCookieObj = JSON.parse(authTokenCookie);
    const foundAuthToken = authTokenCookie ? await AuthToken.findOne(authTokenCookieObj) : null;
    if (!foundAuthToken) {
      throw new ErrorCustom(_MSG.INVALID_ACCESS, httpStatus.FORBIDDEN);
    }
    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.SUCCESS,
      data: 'verified'
    });
  } catch (err) {
    logger.error(err.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: err.message || err,
      success: false
    });
  }
};

export const renewAuthTokensByParams = async (req: RequestCustomWithUser, res: Response, next: NextFunction) => {
  try {
    const { _id } = req.query;

    await checkUserPermissionOfSpace(['super_admin', 'system_admin', 'property_manager'], req.user, req.body.space);

    const authTokens = await AuthToken.find({
      _id
    });
    const bulkOps: AnyBulkWriteOperation<AuthTokenInterface>[] = authTokens.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          $set: {
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            nonce: generateNonceCode(),
            linkId: replaceSpecialChars(generateRandomStringByLength(80)),
            active: true
            // validatedAt: null as any
          },

          $unset: {
            validatedAt: 1
          }
          //remove value
        }
      }
    }));

    // Perform bulk write
    await AuthToken.bulkWrite(bulkOps);
    res.status(httpStatus.OK).json({
      message: _MSG.SUCCESS
    });
  } catch (error) {
    next(error);
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
      loggedAs: 'inhabitant'
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
    logger.error(_MSG.INVALID_ACCESS, err.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      details: err.message || err,
      message: _MSG.ERRORS.GENERIC,
      success: false
    });
  }
};

export async function generateNewAuthTokenInvitationForUnit(req: RequestCustomWithUser, res: Response, next: NextFunction) {
  try {
    const foundUnit = await Unit.findById(req.params.idMongoose);
    if (!foundUnit) {
      throw new ErrorCustom(_MSG.NOT_FOUND_ID(entity, req.params.idMongoose || 'non specificato'), httpStatus.NOT_FOUND);
    }
    if (foundUnit.user) {
      throw new ErrorCustom('Unità già occupata', httpStatus.CONFLICT);
    }
    const newAuthToken = await AuthToken.create({
      type: 'invitation'
    });

    const _newInvitation = await Invitation.createForUnit({
      unit: foundUnit,
      space: foundUnit.space,
      createdBy: req.user._id,
      authToken: newAuthToken._id
    }).catch(async (error) => {
      logger.error(error.stack || error);
      await newAuthToken.deleteOne();
      throw error;
    });

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: {
        _id: newAuthToken._id,
        linkId: newAuthToken.linkId,
        nonce: newAuthToken.nonce,
        active: newAuthToken.active
      }
    });
  } catch (error) {
    logger.error(error);
    next(error);
    return;
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      collection: entity,
      message: error.message || error
    });
  }
}
