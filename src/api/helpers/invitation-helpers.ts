import httpStatus from 'http-status';
import { ErrorCustom } from '../../lib/ErrorCustom';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { RoleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
import AccessPermission from '../../models/AccessPermission';
import Invitation from '../../models/Invitation';
import { InvitationInterface, invitationStatus } from '../../types/mongoose-types/model-types/invitation-interface';
import { IUser, UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { getInvitationByAuthTokenLinkId, InvitationByLinkId } from './authTokenHelper';
import { JWTPayload } from '../../lib/jwt/JwtPayload';
import { NextFunction, Response } from 'express';
import { handleSetCookiesFromPayload } from '../../lib/jwt/jwtUtils';
import { RoleName, UserType } from '../../types/mongoose-types/model-types/role-interface';
import User from '../../models/User';
import AuthToken from '../../models/AuthToken';
import { connectInhabitantFromInvitation } from '../../lib/mongoose/multi-model/connectInhabitantFromInvitation';

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
type SpecificFunction = {
  inhabitant: (param: { invitation: InvitationByLinkId; user: UserBase; authTokenCookie: string; linkId: string }) => void;
  // maintainer: (a: number) => void;
  // property_manager: (a: Record<string, void>) => void;
  // super_admin: (a: string) => void;
};

// Define a base function type for the fallback
type BaseFunction = (res: Response, next: NextFunction, invitation: InvitationByLinkId, user: UserBase) => Promise<boolean>;

// Define the InvitationHandler type
type InvitationHandler = {
  [K in UserType]: K extends keyof SpecificFunction ? SpecificFunction[K] : BaseFunction;
};

// Define the invitationByUserTypeHandler object with the correct type
export const invitationByUserTypeHandler: InvitationHandler = {
  inhabitant: handleAcceptInhabitantInvitationByLogin,
  maintainer: function () {
    throw new Error('Function not implemented.');
  },
  property_manager: function () {
    throw new Error('Function not implemented.');
  },
  system_admin: function () {
    throw new Error('Function not implemented.');
  },
  super_admin: function () {
    throw new Error('Function not implemented.');
  }
};

export async function handleAcceptInhabitantInvitationByLogin({
  invitation,
  user,
  authTokenCookie,
  linkId
}: {
  invitation: InvitationByLinkId;
  user: UserBase;
  authTokenCookie: string;
  linkId: string;
}) {
  const decodedAuthToken = JSON.parse(decodeURIComponent(authTokenCookie));
  const sentNonce = decodedAuthToken.nonce;
  const authToken = await AuthToken.findOne({
    linkId,
    nonce: sentNonce
  });
  // 1. check authToken cookie and compare nonce
  if (!authToken) {
    throw new ErrorCustom('Invalid nonce', httpStatus.BAD_REQUEST);
  }
  // 2. get space, unit,
  await connectInhabitantFromInvitation({ authToken, invitation, user, invitationStatus: 'accepted' });
  // 3. create accessPermission
}

/**
 * @description create accessPermission and userRegistry for the user
 */
export async function handleAcceptInvitationWithoutUnit(aggregatedInvitation: InvitationByLinkId, user: ReqUser | IUser) {
  // create accessPermission
  if (!RoleCache[aggregatedInvitation.userType]?._id) {
    throw new ErrorCustom('Cache is not initialized yet for some reason', httpStatus.NOT_FOUND);
  }

  await AccessPermission.create({
    user: user._id,
    space: aggregatedInvitation.space,
    role: RoleCache[aggregatedInvitation.userType]?._id
  });
}
