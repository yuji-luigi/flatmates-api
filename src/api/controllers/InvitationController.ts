import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Invitation from '../../models/Invitation';
import User from '../../models/User';
import { ErrorCustom } from '../../lib/ErrorCustom';
import AccessPermission from '../../models/AccessPermission';
import { RoleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import { JWTPayload } from '../../lib/jwt/JwtPayload';
import { handleSetCookiesFromPayload } from '../../lib/jwt/jwtUtils';
import { getInvitationByAuthTokenLinkId } from '../helpers/authTokenHelper';

export async function acceptInvitationByLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { linkId } = req.params;
    const { email, password } = req.body;

    const aggregatedInvitation = await getInvitationByAuthTokenLinkId(linkId);

    const user = await User.findOne({
      email
    });

    // case not found user + not matched password same error
    if (!aggregatedInvitation || !(await user?.passwordMatches(password))) {
      throw new ErrorCustom('Incorrect password', httpStatus.UNAUTHORIZED);
    }
    const invitation = await Invitation.findById(aggregatedInvitation._id);

    // create accessPermission
    await AccessPermission.create({
      user: user._id,
      space: invitation.space,
      role: RoleCache[invitation.userType]._id
    });

    invitation.status = 'accepted';
    await invitation.save();

    const payload = new JWTPayload({
      email: user.email,
      loggedAs: invitation.userType,
      spaceId: invitation.space,
      userType: invitation.userType
    });

    handleSetCookiesFromPayload(res, payload);
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
