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
import { PipelineStage } from 'mongoose';
import { ObjectId } from 'bson';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';

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

export async function findAndUpdateInvitationStatus(aggregatedInvitation: InvitationByLinkId | InvitationInterface, _status: invitationStatus) {
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

/**
 * check decoded json pased cookies['auth-token] and authToken and throw error if does not match
 * this step is necessary in pages after inserting nonce.(since we don't request user to input the nonce anymore.)
 * @throws ErrorCustom when the nonce does not match
 *  */
export function checkAuthTokenByCookieToken(authToken: InvitationAuthToken['authToken'] | undefined, authTokenCookie: string) {
  if (!authToken) {
    throw new ErrorCustom('Invalid access', httpStatus.BAD_REQUEST, 'authToken is not found by linkId');
  }
  const decodedAuthToken = JSON.parse(decodeURIComponent(authTokenCookie));
  const sentNonce = decodedAuthToken.nonce;
  if (sentNonce !== authToken.nonce || authToken.linkId !== decodedAuthToken.linkId) {
    throw new ErrorCustom('Invalid nonce', httpStatus.BAD_REQUEST);
  }
  return true;
}

export async function handleAcceptInhabitantInvitationByLogin({
  invitation,
  user
}: // authTokenCookie,
// linkId
{
  invitation: InvitationByLinkId | InvitationInterface;
  user: UserBase;
  authTokenCookie: string;
  // linkId: string;
}) {
  // 2. get space, unit,
  await connectInhabitantFromInvitation({ invitation, user, invitationStatus: 'accepted' });
  // 3. create accessPermission
}

/**
 * @description create accessPermission and userRegistry for the user
 */
export async function handleAcceptInvitationWithoutUnit(aggregatedInvitation: InvitationByLinkId | InvitationInterface, user: ReqUser | IUser) {
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

type InvitationAuthToken = {
  authToken: { _id: string; linkId: string; nonce: string; expiresAt: Date };
  invitation: InvitationInterface;
};
export async function aggregateAuthTokenInvitationByLinkId(
  linkId: string | undefined,
  options?: {
    invitationPipelines?: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[];
  }
): Promise<InvitationAuthToken | undefined> {
  const results = await AuthToken.aggregate<InvitationAuthToken | undefined>([
    {
      $match: {
        linkId: linkId
      }
    },
    {
      $lookup: {
        from: 'invitations',
        localField: '_id',
        foreignField: 'authToken',
        as: 'invitation',
        pipeline: [
          ...(options?.invitationPipelines || []),
          {
            $lookup: {
              from: 'spaces',
              localField: 'space',
              foreignField: '_id',
              as: 'space'
            }
          },
          { $unwind: '$space' }
        ]
      }
    },
    {
      $unwind: { path: '$invitation', preserveNullAndEmptyArrays: true }
    },
    {
      $match: { invitation: { $exists: true, $ne: null } } // again filter out null values. returns empty array if null.
    },
    {
      $project: {
        _id: 0,
        authToken: { _id: '$_id', linkId: '$linkId', nonce: '$nonce', expiresAt: '$expiresAt', type: '$type' },
        invitation: 1
      }
    }
  ]);
  return results[0];
}
export async function updateExpiredOrPendingInvitationsOfCurrentSpaceToBeExpired(spaceId: ObjectId) {
  const invitations = await findExpiredOrPendingInvitationsBySpaceId(spaceId);
  const idDto = invitations.reduce<{ invitationId: ObjectId[]; authTokenId: ObjectId[] }>(
    (acc, invitation) => {
      acc.invitationId.push(invitation._id);
      acc.authTokenId.push(invitation.authToken._id);
      return acc;
    },
    { invitationId: [], authTokenId: [] }
  );

  await AuthToken.deleteMany({
    _id: { $in: idDto.authTokenId }
  });

  await Invitation.deleteMany({
    _id: { $in: idDto.invitationId }
  });
}

async function findExpiredOrPendingInvitationsBySpaceId(spaceId: ObjectId) {
  const [{ pendingVerifyEmailExpired, pending }] = await Invitation.aggregate([
    {
      $match: {
        space: spaceId,
        status: {
          $in: ['pending-verify-email', 'pending']
        }
      }
    },
    {
      $lookup: {
        from: 'authtokens',
        localField: 'authToken',
        foreignField: '_id',
        as: 'authToken'
        //   pipeline: [
        //     {
        //       $match: {
        //         expiresAt: { $lt: new Date() }
        //       }
        //     }
        //   ]
      }
    },
    {
      $unwind: { path: '$authToken', preserveNullAndEmptyArrays: true }
    },
    {
      $facet: {
        pendingVerifyEmailExpired: [
          {
            $match: {
              status: 'pending-verify-email',
              'authToken.expiresAt': { $lt: new Date() }
            }
          }
        ],
        pending: [
          {
            $match: {
              status: 'pending'
            }
          }
        ]
      }
    }
  ]);
  const pendingOrExpiredInvitations = pending.concat(pendingVerifyEmailExpired);
  return pendingOrExpiredInvitations as (InvitationInterface & { authToken: AuthTokenInterface })[];
  // // Results
  // const { pendingVerifyEmailExpired } = results[0];
  // const { pending } = results[0];

  // return await Invitation.aggregate([
  //   {
  //     $match: {
  //       space: spaceId,
  //       status: {
  //         $in: pendingInvitationStatuses
  //       }
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: 'authtokens',
  //       localField: 'authToken',
  //       foreignField: '_id',
  //       as: 'authToken',
  //       pipeline: [
  //         {
  //           $match: {
  //             expiresAt: { $lt: new Date() }
  //           }
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     $unwind: { path: '$authToken', preserveNullAndEmptyArrays: true }
  //   },
  //   {
  //     $match: {
  //       // get expired or pending invitations both
  //       $or: [{ authToken: { $exists: true } }, { status: 'pending' }]
  //     }
  //   }
  // ]);
}
