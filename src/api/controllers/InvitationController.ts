import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import User from '../../models/User';
import { ErrorCustom } from '../../lib/ErrorCustom';
import {
  findAndUpdateInvitationStatus,
  handleFindPendingInvitationByLinkIdAndEmail,
  handleSetCookieOnInvitationSuccess,
  checkCanCreateInvitation,
  handleAcceptInvitationWithoutUnit,
  aggregateAuthTokenInvitationByLinkId,
  checkAuthTokenByCookieToken
} from '../helpers/invitation-helpers';
import { getInvitationByAuthTokenLinkId } from '../helpers/authTokenHelper';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import AuthToken from '../../models/AuthToken';
import { RoleCache, roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import { createInvitationEmail } from '../../lib/node-mailer/createInvitationMail';
import Invitation from '../../models/Invitation';
import { RequestCustom, RequestCustomWithUser } from '../../types/custom-express/express-custom';
import { _MSG } from '../../utils/messages';
import { sendEmail } from '../../lib/node-mailer/nodemailer';
import { ObjectId } from 'bson';
import AccessPermission from '../../models/AccessPermission';
import { connectInhabitantFromInvitation } from '../../lib/mongoose/multi-model/connectInhabitantFromInvitation';
import { sendNewVerifyEmailUnitNewUser } from '../../lib/mongoose/multi-model/sendNewVerifyEmailUnitinhabitant';
import { sendExistingVerifyEmailUnitInhabitant } from '../../lib/mongoose/multi-model/sendExistingVerifyEmailUnitInhabitant';
import { translationResources } from '../../lib/node-mailer/translations';

export async function inviteToSpaceByUserTypeEmail(
  req: RequestCustom & { user: ReqUser; params: { userType: string } },
  res: Response,
  next: NextFunction
) {
  try {
    // need to check if the user is system_admin of the space or super admin
    if (!req.user.isAdminOfSpace && !req.user.isSuperAdmin) {
      throw new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED);
    }
    const { userType: userTypeName } = req.params;
    const { email, space } = req.body;

    await checkCanCreateInvitation({ email, space, userType: userTypeName });

    const authToken = new AuthToken({
      type: 'invitation'
    });

    await authToken.save();

    const userType = roleCache.get(userTypeName);
    if (!userType) {
      throw new ErrorCustom('User type not found', httpStatus.INTERNAL_SERVER_ERROR);
    }

    const invitation = await Invitation.create({
      email,
      space,
      userType: userType?.name,
      authToken,
      type: 'via-email',
      createdBy: req.user._id
    });

    const mailOptions = await createInvitationEmail({ email, space, userType, authToken });
    await sendEmail(mailOptions);

    //TODO: send back the invitation document and add in Redux store.
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'users',
      data: {
        name: '',
        email: invitation.email,
        status: invitation.status
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptInvitationByLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;
    const { email, password } = req.body;

    // 1. login user
    const user = await User.findOne({
      email
    });
    if (!linkId) {
      throw new ErrorCustom('Error in request', httpStatus.NOT_FOUND);
    }
    if (!user) {
      throw new ErrorCustom('User not found. Please register first.', httpStatus.NOT_FOUND);
    }
    if (!(await user?.passwordMatches(password))) {
      throw new ErrorCustom('Incorrect password', httpStatus.UNAUTHORIZED);
    }
    // 2 find and auth by invitation authToken
    const authTokenInvitation = await aggregateAuthTokenInvitationByLinkId(linkId, {
      invitationPipelines: [
        {
          $match: {
            status: {
              $in: ['pending', 'pending-email-verification']
            },
            acceptedAt: { $exists: false }
          }
        }
      ]
    });
    const { invitation, authToken } = authTokenInvitation || {};
    if (!invitation) {
      throw new ErrorCustom('Invitation not found', httpStatus.NOT_FOUND);
    }
    // TODO: handle connect inhabitant and unit by logging in from qrcode
    // TODO:USE THE HANDLER PASSING ALWAYS THE SAME ARGUMENTS FOR EACH CASE. SO TYPESCRIPT DOES NOT THROW ERROR(COULD BE AVOIDED BY USING ANY OR TYPE_GUARD)

    if (invitation.userType === 'inhabitant' && invitation.unit) {
      checkAuthTokenByCookieToken(authToken, req.cookies['auth-token']);
      await connectInhabitantFromInvitation({
        invitation: invitation,
        user,
        invitationStatus: 'accepted'
      });
    } else {
      // check email in all other cases.(for now)
      if (invitation.email !== email) {
        throw new ErrorCustom('Email does not match with invitation email', httpStatus.BAD_REQUEST);
      }
      await handleAcceptInvitationWithoutUnit(invitation, user);
    }
    await findAndUpdateInvitationStatus(invitation, 'accepted');

    handleSetCookieOnInvitationSuccess(res, invitation, user);

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: 'Invitation accepted successfully',
        userType: invitation.userType // now passing userType string to log user in from frontend /auth/invitation/login?redirect=linkIdxxx
      }
    });
  } catch (error) {
    next(error);
  }
}
export async function declineInvitationByLinkId(req: Request, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;

    // 2 find and auth by invitation authToken
    const invitationDocument = await getInvitationByAuthTokenLinkId(linkId, { hydrate: true });
    if (!invitationDocument) {
      throw new ErrorCustom('We could not find your invitation. Please check your email.', httpStatus.NOT_FOUND);
    }
    invitationDocument.status = 'declined';
    await invitationDocument.save();

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: 'Invitation declined successfully'
      }
    });
  } catch (error) {
    next(error);
  }
}

// TODO: MOVE AUTH_TOKEN LOGIC TO HERE. ALSO ENDPOINT FROM FRONTEND TO BE CHANGED
export async function acceptInvitationByRegistering(req: Request, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;
    const { email, password, name, surname, password2, locale } = req.body;
    if (password !== password2) {
      throw new ErrorCustom('Passwords do not match', httpStatus.BAD_REQUEST);
    }

    const authTokenInvitation = await aggregateAuthTokenInvitationByLinkId(linkId, {
      invitationPipelines: [
        {
          $match: {
            status: {
              $in: ['pending', 'pending-email-verification']
            },
            acceptedAt: { $exists: false }
          }
        }
      ]
    });
    const { invitation, authToken } = authTokenInvitation || {};

    if (!invitation) {
      throw new ErrorCustom('Invitation not found', httpStatus.NOT_FOUND);
    }
    const newUser = new User({
      email,
      password,
      name,
      surname,
      locale
    });

    if (invitation?.userType === 'inhabitant' && invitation?.unit) {
      checkAuthTokenByCookieToken(authToken, req.cookies['auth-token']);

      if (invitation.status === 'pending-email-verification') {
        await sendExistingVerifyEmailUnitInhabitant({ newUser, invitation });
      } else {
        await sendNewVerifyEmailUnitNewUser({ newUser, invitation });
      }
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Verification email has been sent! Please check your email to verify your account.',
        code: 'need-verification-email'
      });
      return;
    }
    if (invitation?.userType !== 'inhabitant') {
      if (invitation.email !== email) {
        throw new ErrorCustom('Invitation not found for the email. Email must be the same email you got invitation.', httpStatus.BAD_REQUEST);
      }

      await AccessPermission.create({
        user: newUser._id,
        space: invitation.space,
        role: RoleCache[invitation.userType]._id
      });
      await Invitation.updateOne({ _id: invitation._id }, { status: 'accepted' }, { runValidators: true });

      newUser.active = true;
      await newUser.save();
      // await handleAcceptInvitationWithoutUnit(invitation, user);
      // const invitation = await findAndUpdateInvitationStatus(aggregatedInvitation, 'accepted');
    }
    const foundAuthToken = await AuthToken.findById(authToken);
    if (!foundAuthToken) {
      throw new ErrorCustom('You are registered.', httpStatus.NOT_FOUND);
    }
    foundAuthToken.active = false;
    foundAuthToken.validatedAt = new Date();
    await foundAuthToken.save();
    // handleSetCookieOnInvitationSuccess(res, invitation, user);
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Invitation accepted successfully',
      code: 'invitation-accepted'
    });
  } catch (error) {
    next(error);
  }
}
export async function __acceptInvitationByRegistering(req: Request, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;
    const { email, password, name, surname } = req.body;

    const aggregatedInvitation = await handleFindPendingInvitationByLinkIdAndEmail(linkId, email);

    const user = await User.create({
      email,
      password,
      name,
      surname
    });

    await handleAcceptInvitationWithoutUnit(aggregatedInvitation, user);
    const invitation = await findAndUpdateInvitationStatus(aggregatedInvitation, 'accepted');

    handleSetCookieOnInvitationSuccess(res, invitation, user);

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: 'Invitation accepted successfully'
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function preRegisterWithVerificationEmail(_req: Request, res: Response, next: NextFunction) {
  try {
    res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: 'Invitation accepted successfully'
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptInvitationByLoggedUserAndLinkId(req: Request & { user: ReqUser }, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;
    const { user } = req;
    if (!user || !linkId) {
      throw new ErrorCustom('Invalid User or Invitation access', httpStatus.UNAUTHORIZED);
    }
    const aggregatedInvitation = await handleFindPendingInvitationByLinkIdAndEmail(linkId, user.email);
    await handleAcceptInvitationWithoutUnit(aggregatedInvitation, user);
    const invitation = await findAndUpdateInvitationStatus(aggregatedInvitation, 'accepted');
    handleSetCookieOnInvitationSuccess(res, invitation, user);

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: 'Invitation accepted successfully'
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvitationByLinkIdAndSendToClient(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.params.linkId) {
      throw new ErrorCustom('Error in request', httpStatus.NOT_FOUND);
    }
    const invitation = await getInvitationByAuthTokenLinkId(req.params.linkId);
    const data = invitation && {
      _id: invitation._id,
      status: invitation.status,
      userType: invitation.userType,
      space: {
        name: invitation.space.name
      }
    };
    res.status(httpStatus.OK).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function sendAuthTokenOfUnitFromInvitation(req: RequestCustomWithUser, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const translations = translationResources[req.user.locale];
    const authTokens = await AuthToken.aggregate([
      {
        $lookup: {
          from: 'invitations',
          localField: '_id',
          foreignField: 'authToken',
          as: 'invitation',
          pipeline: [
            {
              $match: {
                $and: [...(status ? [{ status: status }] : [{}]), { unit: new ObjectId(req.params.idMongoose) }]
              }
            }
          ]
        }
      },
      { $unwind: { path: '$invitation', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          invitation: { $exists: true }
        }
      },
      {
        $project: {
          _id: 1,
          active: 1,
          linkId: 1,
          nonce: 1,
          invitationStatus: '$invitation.status'
        }
      },
      {
        $addFields: {
          _id: {
            $cond: {
              if: { $eq: ['$invitationStatus', 'pending-email-verification'] },
              then: '',
              else: '$_id'
            }
          },
          linkId: {
            $cond: {
              if: { $eq: ['$invitationStatus', 'pending-email-verification'] },
              then: '',
              else: '$linkId'
            }
          },
          nonce: {
            $cond: {
              if: { $eq: ['$invitationStatus', 'pending-email-verification'] },
              then: '',
              else: '$nonce'
            }
          },
          active: {
            $cond: {
              if: { $eq: ['$invitationStatus', 'pending-email-verification'] },
              then: true,
              else: '$active'
            }
          },
          isAvailable: {
            $cond: {
              if: { $eq: ['$invitationStatus', 'pending-email-verification'] },
              then: false,
              else: true
            }
          },
          message: {
            $cond: {
              if: { $eq: ['$invitationStatus', 'pending-email-verification'] },
              then: translations('User is registering. QR-Code is not available'),
              else: ''
            }
          }
        }
      }
    ]);

    // NOTE: don't destructure for debug purposes. (was returning array with all the authTokens) added existing check
    const authToken = authTokens[0];
    // console.log(JSON.stringify(authToken, null, 2));
    res.status(httpStatus.OK).json({
      success: true,
      data: authToken
    });
  } catch (error) {
    next(error);
  }
}

export interface QRCodeAddFieldsStage {
  $addFields: {
    _id: {
      $cond: {
        if: { $eq: ['$invitationStatus', 'pending-email-verification'] };
        then: string;
        else: '$_id';
      };
    };
    linkId: {
      $cond: {
        if: { $eq: ['$invitationStatus', 'pending-email-verification'] };
        then: string;
        else: '$linkId';
      };
    };
    nonce: {
      $cond: {
        if: { $eq: ['$invitationStatus', 'pending-email-verification'] };
        then: string;
        else: '$nonce';
      };
    };
    active: {
      $cond: {
        if: { $eq: ['$invitationStatus', 'pending-email-verification'] };
        then: true;
        else: '$active';
      };
    };
    isAvailable: {
      $cond: {
        if: { $eq: ['$invitationStatus', 'pending-email-verification'] };
        then: true;
        else: false;
      };
    };
    message: {
      $cond: {
        if: { $eq: ['$invitationStatus', 'pending-email-verification'] };
        then: string;
        else: string;
      };
    };
  };
}
