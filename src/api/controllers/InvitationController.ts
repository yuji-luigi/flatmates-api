import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import User from '../../models/User';
import { ErrorCustom } from '../../lib/ErrorCustom';
import {
  handleAcceptInvitation,
  findAndUpdateInvitationStatus,
  handleFindPendingInvitationByLinkIdAndEmail,
  handleSetCookieOnInvitationSuccess
} from '../helpers/invitation-helpers';
import { getInvitationByAuthTokenLinkId } from '../helpers/authTokenHelper';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import AuthToken from '../../models/AuthToken';
import { roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import { createInvitationEmail } from '../../lib/node-mailer/createInvitationMail';
import Invitation from '../../models/Invitation';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { _MSG } from '../../utils/messages';
import { sendEmail } from '../helpers/nodemailerHelper';

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

    const authToken = new AuthToken();

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
    const aggregatedInvitation = await handleFindPendingInvitationByLinkIdAndEmail(linkId, email);

    await handleAcceptInvitation(aggregatedInvitation, user);
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

    await handleAcceptInvitation(aggregatedInvitation, user);
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

export async function acceptInvitationByLoggedUserAndLinkId(req: Request & { user: ReqUser }, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;
    const { user } = req;
    if (!user || !linkId) {
      throw new ErrorCustom('Invalid User or Invitation access', httpStatus.UNAUTHORIZED);
    }
    const aggregatedInvitation = await handleFindPendingInvitationByLinkIdAndEmail(linkId, user.email);
    await handleAcceptInvitation(aggregatedInvitation, user);
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
    const data = invitation && { _id: invitation._id, status: invitation.status };
    res.status(httpStatus.OK).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}