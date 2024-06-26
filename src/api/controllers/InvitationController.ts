import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import User from '../../models/User';
import { ErrorCustom } from '../../lib/ErrorCustom';
import {
  findAndUpdateInvitationStatus,
  handleFindPendingInvitationByLinkIdAndEmail,
  handleSetCookieOnInvitationSuccess,
  checkCanCreateInvitation,
  handleAcceptInhabitantInvitationByLogin,
  handleAcceptInvitationWithoutUnit
} from '../helpers/invitation-helpers';
import { getInvitationByAuthTokenLinkId } from '../helpers/authTokenHelper';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import AuthToken from '../../models/AuthToken';
import { roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import { createInvitationEmail } from '../../lib/node-mailer/createInvitationMail';
import Invitation from '../../models/Invitation';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { _MSG } from '../../utils/messages';
import { sendEmail, sendVerificationEmail } from '../../lib/node-mailer/nodemailer';
import { ObjectId } from 'bson';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { Document } from 'mongoose';
import VerificationEmail from '../../models/VerificationEmail';

export async function inviteToSpaceByUserTypeEmail(
  req: RequestCustom & { user: ReqUser; params: { userType: string } },
  res: Response,
  next: NextFunction
) {
  try {
    // need to check if the user is system_admin of the space or super admin
    if (!req.user.isAdminOfCurrentSpace && !req.user.isSuperAdmin) {
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
      createdBy: req.user._id
    });

    const mailOptions = await createInvitationEmail({ email, space, userType, authToken });
    await sendEmail(mailOptions);

    //TODO: send back the invitation document and add in Redux store.
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'users',
      data: { name: 'pending_invite', email: invitation.email }
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
    const aggregatedInvitation = await getInvitationByAuthTokenLinkId(linkId, { invitationStatus: 'pending' });
    if (!aggregatedInvitation) {
      throw new ErrorCustom('Invitation not found', httpStatus.NOT_FOUND);
    }
    // TODO: handle connect inhabitant and unit by logging in from qrcode
    // TODO:USE THE HANDLER PASSING ALWAYS THE SAME ARGUMENTS FOR EACH CASE. SO TYPESCRIPT DOES NOT THROW ERROR(COULD BE AVOIDED BY USING ANY OR TYPE_GUARD)

    if (aggregatedInvitation.userType === 'inhabitant' && aggregatedInvitation.unit) {
      await handleAcceptInhabitantInvitationByLogin({ invitation: aggregatedInvitation, user, authTokenCookie: req.cookies.authToken, linkId });
    } else {
      // check email in all other cases.(for now)
      if (aggregatedInvitation.email !== email) {
        throw new ErrorCustom('Email does not match with invitation email', httpStatus.BAD_REQUEST);
      }
    }
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

export async function acceptInvitationByRegistering(req: Request, res: Response, next: NextFunction) {
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

export async function preRegisterWithVerificationEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;
    const { email, password, name, surname, password2, locale } = req.body;

    if (password !== password2) {
      throw new ErrorCustom('Passwords do not match', httpStatus.BAD_REQUEST);
    }

    const aggregatedInvitation = await getInvitationByAuthTokenLinkId(linkId, {
      invitationStatus: { $in: ['pending', 'pending-register'] }
    });

    if (!aggregatedInvitation) {
      throw new ErrorCustom('Invitation not found', httpStatus.NOT_FOUND);
    }
    // 1. check if the invitation is pending-register and aggregate VerificationEmail. by invitation id.
    if (aggregatedInvitation.status === 'pending-register') {
      const verificationEmail = await VerificationEmail.findOne({
        invitation: aggregatedInvitation._id
      });
      if (!verificationEmail) {
        throw new ErrorCustom('Verification email not found', httpStatus.NOT_FOUND);
      }

      const upUser = await User.findById(verificationEmail.user);
      if (!upUser) {
        throw new ErrorCustom('User not found', httpStatus.NOT_FOUND);
      }
      await AuthToken.deleteOne({ _id: verificationEmail.authToken });
      const newAuthToken = await AuthToken.create({
        type: 'email-verify'
      });
      verificationEmail.authToken = newAuthToken._id;
      upUser.email = email;
      upUser.password = password;
      upUser.name = name;
      upUser.surname = surname;
      upUser.locale = locale;
      await upUser.save();
      await verificationEmail.save();
      await sendVerificationEmail({
        ...verificationEmail.toObject(),
        authToken: newAuthToken.toObject(),
        user: upUser.toObject()
      });
    } else {
      const user = new User({
        email,
        password,
        name,
        surname,
        locale
      });

      // 1. create authTokens for user
      const authToken = (await AuthToken.create({
        type: 'email-verify'
      })) as Document & AuthTokenInterface & { type: 'email-verify' };

      const newVerificationEmail = await VerificationEmail.create({
        user,
        invitation: aggregatedInvitation._id,
        authToken: authToken._id
      });

      // 2. create email options and send email with the options

      await sendVerificationEmail({
        ...newVerificationEmail.toObject(),
        authToken: authToken.toObject(),
        user: user.toObject()
      });

      await user.save();
      await findAndUpdateInvitationStatus(aggregatedInvitation, 'pending-register');
    }

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

export async function sendAuthTokenOfUnitFromInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
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
        // at least invitation field is present
        $match: {
          invitation: { $exists: true }
        }
      },
      {
        $project: {
          _id: 1,
          active: 1,
          linkId: 1,
          nonce: 1
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
