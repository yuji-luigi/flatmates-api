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

export async function getInvitationByLinkId(req: Request, res: Response, next: NextFunction) {
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
