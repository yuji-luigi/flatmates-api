import { NextFunction, Request, Response } from 'express';
import Unit from '../../models/Unit';
import httpStatus from 'http-status';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { RequestCustomWithUser } from '../../types/custom-express/express-custom';
import { checkUserPermissionOfSpace } from '../../middlewares/isLoggedIn';
import { ObjectId } from 'bson';
import { ErrorCustom } from '../../lib/ErrorCustom';
import logger from '../../lib/logger';
import { connectInhabitantFromInvitation } from '../../lib/mongoose/multi-model/connectInhabitantFromInvitation';
import AuthToken from '../../models/AuthToken';
import VerificationEmail from '../../models/VerificationEmail';
import { InvitationInterface } from '../../types/mongoose-types/model-types/invitation-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { _MSG } from '../../utils/messages';
import { VerificationEmailInterface } from '../../types/mongoose-types/model-types/verification-email-interface';

export async function verifyEmailByLinkId(req: Request, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;

    // for checking the nonce is valid to linkId
    // TODO: THIS MOVETO POST /invitations/register/:linkId. handle invitations depends on invitation.userType.

    // const session = await startSession();
    // session.startTransaction();
    // verified is when authToken is found. so this is not necessary variable now.

    // const authToken = await verifyAuthTokenByNonceAndLinkId({ linkId: req.params.linkId, nonce: req.body.nonce });
    const authToken = await AuthToken.findOne({ linkId });
    if (!authToken) throw new ErrorCustom(_MSG.INVALID_ACCESS, httpStatus.FORBIDDEN);

    if (!authToken.active || authToken.isNotValidValidatedAt()) {
      // return res.status(httpStatus.OK).json({
      //   success: true,
      //   message: 'Il tuo account è già attivato.'
      // });
      throw new ErrorCustom('Tuo account é già attivato.', httpStatus.FORBIDDEN);
    }

    const results: ({ user: IUser; invitation: InvitationInterface } & VerificationEmailInterface)[] = await VerificationEmail.aggregate([
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
              $unwind: {
                path: '$unit',
                preserveNullAndEmptyArrays: true
              }
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
          type: 1,
          status: 1,
          authToken: 1,
          unit: '$invitation.unit._id',
          user: { _id: 1, active: 1 },
          invitation: {
            _id: 1,
            status: 1,
            space: 1,
            userType: 1,
            type: 1,
            unit: 1
          }
        }
      }
    ]);

    if (results.length === 0) {
      throw new ErrorCustom(_MSG.INVALID_ACCESS, httpStatus.FORBIDDEN);
    }
    const [result] = results;
    const { user, invitation } = result;

    // case 1: connect user unit and accessPermission. update invitation status to completed-register.
    if (result.type === 'unit-register-email-verification') {
      await connectInhabitantFromInvitation({
        invitation,
        user,
        invitationStatus: 'completed-register'
      });
      // other case to define
    } else {
      throw new ErrorCustom(_MSG.INVALID_ACCESS, httpStatus.FORBIDDEN);
    }

    await VerificationEmail.updateOne(
      {
        _id: result._id
      },
      { status: 'verified' },
      { runValidators: true }
    );

    await AuthToken.updateOne(
      {
        _id: authToken._id
      },
      { active: false, validatedAt: new Date() },
      { runValidators: true }
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: _MSG.SUCCESS,
      code: 'email-verified'
    });
  } catch (err) {
    logger.error(err.stack);
    next(err);
  }
}

export async function removeUserFromUnit(req: RequestCustomWithUser, res: Response, next: NextFunction) {
  try {
    const [unit] = await Unit.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.idMongoose)
        }
      },
      {
        $lookup: {
          from: 'spaces',
          localField: 'space',
          foreignField: '_id',
          as: 'space'
        }
      },
      { $unwind: '$space' }
    ]);
    await checkUserPermissionOfSpace(['system_admin', 'property_manager'], req.user, unit.space._id.toString());
    const updated = await Unit.findOneAndUpdate(
      {
        _id: unit._id
      },
      { $unset: { user: '' } },
      { runValidators: true, new: true }
    );

    res.status(httpStatus.OK).json({
      message: 'User removed from unit',
      data: updated,
      success: true
    });
  } catch (error) {
    next(error);
  }
}
export interface AddressInfo {
  name: string;
  address: string;
  state: string;
  postalCode: string;
  cityCode?: string;
  stateCode?: string;
  authToken?: AuthTokenInterface;
}
