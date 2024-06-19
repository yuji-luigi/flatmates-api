import httpStatus from 'http-status';
import { ErrorCustom } from '../../lib/ErrorCustom';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { RoleCache, roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import AccessPermission from '../../models/AccessPermission';
import Invitation from '../../models/Invitation';
import { InvitationInterface, invitationStatus } from '../../types/mongoose-types/model-types/invitation-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { getInvitationByAuthTokenLinkId, InvitationByLinkId } from './authTokenHelper';
import { JWTPayload } from '../../lib/jwt/JwtPayload';
import { Response } from 'express';
import { handleSetCookiesFromPayload } from '../../lib/jwt/jwtUtils';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
import User from '../../models/User';

/**
 * @description email is optional for register route
 * @throws ErrorCustom when the invitation is not found as Not Found
 */
export async function handleFindPendingInvitationByLinkIdAndEmail(linkId: undefined | string, email: string | undefined) {
  const aggregatedInvitation = await getInvitationByAuthTokenLinkId(linkId, {
    additionalMatchFields: { email },
    invitationStatus: 'pending'
  });

  if (!aggregatedInvitation) {
    throw new ErrorCustom('We could not find your invitation. Email must be the invited email. Please check your email.', httpStatus.NOT_FOUND);
  }
  return aggregatedInvitation;
}

/**
 * @description create accessPermission and userRegistry for the user
 */
export async function handleAcceptInvitation(aggregatedInvitation: InvitationByLinkId, user: ReqUser | IUser) {
  // create accessPermission
  if (!RoleCache[aggregatedInvitation.userType]?._id) {
    throw new ErrorCustom('Cache is not initialized yet for some reason', httpStatus.NOT_FOUND);
  }

  await AccessPermission.create({
    user: user._id,
    space: aggregatedInvitation.space,
    role: RoleCache[aggregatedInvitation.userType]?._id
  });

  // await UserRegistry.create({
  //   user: user._id,
  //   space: aggregatedInvitation.space,
  //   role: RoleCache[aggregatedInvitation.userType]._id
  // });
}

export async function findAndUpdateInvitationStatus(aggregatedInvitation: InvitationByLinkId, _status: invitationStatus) {
  const invitation = await Invitation.findById(aggregatedInvitation._id);
  if (!invitation) {
    throw new ErrorCustom('Invitation not found', httpStatus.NOT_FOUND);
  }
  invitation.status = _status;
  await invitation.save();
  return invitation;
}

export function handleSetCookieOnInvitationSuccess(res: Response, invitation: InvitationInterface, user: ReqUser | IUser) {
  const payload = new JWTPayload({
    email: user.email,
    loggedAs: invitation.userType,
    spaceId: invitation.space,
    userType: invitation.userType
  });
  handleSetCookiesFromPayload(res, payload);
}

/**
 * @throws ErrorCustom when the email is already invited or already is assigned to the space with the same userType
 */
export async function checkCanCreateInvitation({ email, space, userType }: { email: string; space: string; userType: RoleName }) {
  const foundInvitation = await Invitation.findOne({ email, space, userType, status: { $ne: 'accepted' } });
  if (foundInvitation) {
    throw new ErrorCustom(`The email: <${email}> is already invited to this space as ${RoleCache[userType].label}`, httpStatus.CONFLICT);
  }
  const user = await User.findOne({ email });
  if (user) {
    const foundAccessPermission = await AccessPermission.findOne({ user, space, role: RoleCache[userType]?._id });
    if (foundAccessPermission) {
      throw new ErrorCustom(`The email: <${email}> is already collaborating in the space as ${RoleCache[userType].label}`, httpStatus.CONFLICT);
    }
  }
  return true;
}
