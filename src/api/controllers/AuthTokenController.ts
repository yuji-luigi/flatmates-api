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
import VerificationEmail from '../../models/VerificationEmail';
import Invitation from '../../models/Invitation';
import Unit from '../../models/Unit';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { InvitationInterface } from '../../types/mongoose-types/model-types/invitation-interface';
import { checkForPermissions } from '../../middlewares/isLoggedIn';
import { connectInhabitantFromInvitation } from '../../lib/mongoose/multi-model/connectInhabitantFromInvitation';

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

// TODO: VERIFY AND REMOVE. BUT RETURNS ONLY LINKID TO CLIENT WICTH IS PAYLOAD OF THE REQUEST
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
// TODO:
export const verifyEmailRegisterInhabitant = async (req: RequestCustom, res: Response) => {
  try {
    // const session = await startSession();
    // session.startTransaction();
    // verified is when authToken is found. so this is not necessary variable now.

    // const authToken = await verifyAuthTokenByNonceAndLinkId({ linkId: req.params.linkId, nonce: req.body.nonce });
    const authToken = await AuthToken.findOne({ linkId: req.params.linkId });
    if (!authToken) throw new ErrorCustom(_MSG.INVALID_ACCESS, httpStatus.FORBIDDEN);

    if (!authToken.active || authToken.isNotValidValidatedAt()) {
      throw new ErrorCustom('Tuo account é già attivato.', httpStatus.FORBIDDEN);
    }

    const results: { user: IUser; invitation: InvitationInterface }[] = await VerificationEmail.aggregate([
      { $match: { authToken: authToken._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'invitations',
          localField: 'invitation',
          foreignField: '_id',
          as: 'invitation',
          pipeline: [
            {
              $lookup: {
                from: 'units',
                localField: 'unit',
                foreignField: '_id',
                as: ' unit'
              }
            },
            {
              $unwind: '$unit'
            }
          ]
        }
      },
      {
        $unwind: '$user'
      },
      {
        $unwind: '$invitation'
      },
      {
        $project: {
          authToken: 1,
          unit: '$invitation.unit._id',
          user: { _id: 1, active: 1 },
          invitation: { _id: 1, status: 1, space: 1, userType: 1, unit: 1 }
        }
      }
    ]);
    if (results.length === 0) {
      throw new ErrorCustom(_MSG.INVALID_ACCESS, httpStatus.FORBIDDEN);
    }
    // TODO: TOP EXPIRATION LOGIC
    const [result] = results;
    const { user, invitation } = result;

    /**
     * 1. activate user.
     * 2.
     */
    // TODO: check if it works without problem
    await connectInhabitantFromInvitation({ invitation, user, authToken });
    // await User.updateOne({ _id: user._id }, { active: true }, { new: true, runValidators: true }); /* .session(session) */
    // await Unit.updateOne({ _id: invitation.unit }, { user: user._id }, { new: true, runValidators: true });
    // await Invitation.updateOne(
    //   { _id: invitation._id },
    //   { status: 'completed-register', acceptedAt: new Date() },
    //   { new: true, runValidators: true }
    // ); /* .session(session) */

    // // await session.commitTransaction();
    // // session.endSession();

    // // TODO: 1.SEND THANK YOU FOR REGISTERING WELCOME EMAIL
    // // TODO: 1 connect user and space.(Create AccessPermission)
    // await AccessPermission.create({
    //   user: user._id,
    //   space: invitation.space,
    //   role: RoleCache[invitation.userType]
    // });

    // authToken.active = false;
    // authToken.validatedAt = new Date();
    // await authToken.save();
    // res.cookie('auth-token', stringifyAuthToken(authToken), sensitiveCookieOptions);

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

    await checkForPermissions(['super_admin', 'system_admin', 'property_manager'], req.user, req.body.space);

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
            linkId: replaceSpecialChars(generateRandomStringByLength(80))
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

// TODO: DEPRECATE THIS?
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

export async function generateNewAuthTokenInvitationForUnit(req: RequestCustomWithUser, res: Response, next: NextFunction) {
  try {
    const foundUnit = await Unit.findById(req.params.idMongoose);
    if (!foundUnit) {
      throw new ErrorCustom(_MSG.NOT_FOUND_ID(entity, req.params.idMongoose || 'non specificato'), httpStatus.NOT_FOUND);
    }
    const newAuthToken = await AuthToken.create({
      type: 'invitation'
    });

    const _newInvitation = await Invitation.create({
      userType: 'inhabitant',
      status: 'pending',
      unit: foundUnit._id,
      space: foundUnit.space,
      createdBy: req.user._id,
      authToken: newAuthToken._id,
      displayName: foundUnit.tenantName || foundUnit.ownerName
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
