import AuthToken, { AuthTokenDocument } from '../../models/AuthToken';
import Invitation from '../../models/Invitation';

import { RequestCustom } from '../../types/custom-express/express-custom';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { _MSG } from '../../utils/messages';
import logger from '../../lib/logger';
import { ObjectId } from 'mongodb';
import { Document, PipelineStage } from 'mongoose';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
import { InvitationInterface, invitationStatus } from '../../types/mongoose-types/model-types/invitation-interface';
import { ErrorCustom } from '../../lib/ErrorCustom';
import httpStatus from 'http-status';
/**
 * @description verify pin from request body and return authToken document with populated space
 */
export async function verifyPinFromRequest(req: RequestCustom): Promise<{ verified: boolean; authToken?: AuthTokenInterface | null }> {
  const { linkId, idMongoose } = req.params;
  const { pin } = req.body;

  const data = await AuthToken.findOne({
    ...(idMongoose && { _id: idMongoose }),
    linkId,
    nonce: pin,
    active: true
  });
  const found = data ? true : false;

  return { verified: found, authToken: data };
}

export async function verifyAuthTokenByNonceAndLinkId({ nonce, linkId }: { nonce: string; linkId: string }): Promise<AuthTokenDocument> {
  const authToken = await AuthToken.findOne({
    linkId
  });

  if (authToken === null) {
    throw new ErrorCustom(_MSG.OBJ_NOT_FOUND, httpStatus.NOT_FOUND);
  }
  if (authToken.nonce !== +nonce) {
    throw new ErrorCustom(_MSG.INVALID_PIN, httpStatus.BAD_REQUEST);
  }
  if (!authToken.active || authToken.expiresAt < new Date()) {
    throw new ErrorCustom(_MSG.EXPIRED, httpStatus.BAD_REQUEST);
  }
  // validatedAt is earlier than 15 minutes ago throw error
  if (authToken.validatedAt && authToken.isNotValidValidatedAt()) {
    throw new ErrorCustom(
      'qr-code is expired. Please contact administrator and re-generate the qr-code along with 6 digits code.' /* 'qr_code_expired' */,
      httpStatus.BAD_REQUEST
    );
  }

  if (!authToken.validatedAt) {
    authToken.validatedAt = new Date();
    await authToken.save();
  }
  return authToken;
}

/**
 * @description stringify _id and linkId of authToken document. !!includes nonce!! */
export function stringifyAuthToken(authToken: AuthTokenInterface): string {
  const object = {
    _id: authToken._id,
    linkId: authToken.linkId,
    nonce: authToken.nonce
  };
  return JSON.stringify(object);
}

/**
 * @description find authToken from cookie. !!includes nonce!!
 */
export async function findAuthTokenFromCookie(cookie: string) {
  const { _id, linkId, nonce } = JSON.parse(cookie);
  const foundToken = await AuthToken.findOne({
    _id,
    linkId,
    nonce
  });

  return foundToken;
}

export function checkAuthTokenForError(authToken: AuthTokenInterface | undefined | null): authToken is AuthTokenInterface {
  if (!authToken) {
    return false;
  }
  if (!authToken.active) {
    return false;
  }
  return true;
}

export async function handleCreateAuthTokenForUser(newUser: IUser) {
  try {
    const docHolder = {
      ref: 'users',
      instanceId: newUser._id
    };
    const foundToken = await AuthToken.findOne({ docHolder });
    if (foundToken) return;

    const created = await AuthToken.create({ docHolder });
    console.log(created.toObject());
  } catch (error) {
    logger.error('error creating auth token for user. function: handleCreateAuthTokenForUser in authTokenHelper.ts');
    throw new Error(error.message || error);
  }
}
/**
 *
 * @param newUsers
 * @description create auth token handled by ids array
 */
export async function handleCreateAuthTokensForUser(newUserIds: ObjectId[]) {
  try {
    const foundTokens = await AuthToken.find({ 'docHolder.instanceId': { $in: newUserIds } });

    if (foundTokens.length === newUserIds.length) return;
    // check if the token exists for each users. returns array of users that doesn't have token
    // const filteredIds = newUserIds.filter((id) => !foundTokens.some((token) => token.docHolder.instanceId.toString() === id.toString()));
    // // create docHolders array to save in AuthToken collection
    // const authTokenMap = filteredIds.map((id) => ({
    //   space: spaceId,
    //   docHolder: { ref: 'users', instanceId: id }
    // }));
    //
    // const created = await AuthToken.insertMany(authTokenMap.map((tokenModel) => tokenModel));
    console.log('todo');
  } catch (error) {
    logger.error('error creating auth tokens for users. function: handleCreateAuthTokensForUser in authTokenHelper.ts');
    throw new Error(error.message || error);
  }
}

// function isPopulatedSpace(space: ObjectId | ISpace): space is ISpace {
//   return !(space instanceof ObjectId);
// }

// function isObjectIdOrganization(organization: ObjectId | IOrganization | string): organization is ObjectId {
//   return organization instanceof ObjectId;
// }

export function typeGuardAuthTokenSpaceOrg(
  authToken: AuthTokenInterface | null | undefined
): authToken is AuthTokenInterface & { space: ISpace & { organization: ObjectId } } {
  if (!authToken) {
    throw new Error('pin not verified');
  }
  // if (!isPopulatedSpace(authToken.space)) throw new Error('space is not populated');
  // if (!isObjectIdOrganization(authToken.space.organization)) throw new Error('organization is not ObjectId');
  return true;
}
type InvitationStatusQuery = invitationStatus | { $or: invitationStatus[] } | { $and: invitationStatus[] } | { $in: invitationStatus[] };

export interface InvitationByLinkId {
  _id: ObjectId;
  email: string | undefined;
  userType: RoleName;
  status: InvitationStatusQuery;
  createdBy: { email: string; surname: string; name: string };
  space: { _id: ObjectId; name: string; address: string };
  unit: ObjectId;
}

// Overload signatures
export async function getInvitationByAuthTokenLinkId(
  linkId: undefined | string,
  options?: {
    additionalMatchFields?: Record<string, string | undefined>;
    invitationStatus?: InvitationStatusQuery;
    hydrate?: false | undefined;
  }
): Promise<InvitationByLinkId | undefined>;

export async function getInvitationByAuthTokenLinkId(
  linkId: undefined | string,
  options?: {
    additionalMatchFields?: Record<string, string | undefined>;
    invitationStatus?: InvitationStatusQuery;
    hydrate: true;
  }
): Promise<(InvitationInterface & Document) | undefined>;

export async function getInvitationByAuthTokenLinkId(
  linkId: undefined | string,
  options: {
    additionalMatchFields?: Record<string, string | undefined>;
    invitationStatus?: invitationStatus | { $or: invitationStatus[] } | { $and: invitationStatus[] } | { $in: invitationStatus[] };
    hydrate?: boolean;
  } = {}
): Promise<InvitationByLinkId | (InvitationInterface & Document) | undefined> {
  const invitationStatusPP = options.invitationStatus && [
    {
      $match: {
        status: options.invitationStatus,
        ...(options.additionalMatchFields || {})
      }
    }
  ];
  const invitations = await AuthToken.aggregate<InvitationByLinkId | undefined>([
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
          ...(invitationStatusPP || []),
          {
            $lookup: {
              from: 'spaces',
              localField: 'space',
              foreignField: '_id',
              as: 'space'
            }
          },
          { $unwind: '$space' },
          // {
          //   $lookup: {
          //     from: 'units',
          //     localField: 'unit',
          //     foreignField: '_id',
          //     as: 'unit'
          //   }
          // },
          // { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy'
            }
          },
          { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
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
      $replaceRoot: { newRoot: '$invitation' }
    },
    {
      $project: {
        _id: 1,
        email: 1,
        userType: 1,
        status: 1,
        createdBy: {
          name: 1,
          surname: 1,
          email: 1
        },
        unit: 1,
        space: {
          name: 1,
          _id: 1,
          address: 1
        }
      }
    }
  ]).catch((error) => {
    error.message = 'error finding invitation';
    throw new ErrorCustom(error, httpStatus.INTERNAL_SERVER_ERROR);
  });
  const invitation = invitations[0];
  if (options.hydrate && invitation) {
    const mongooseInvitation = Invitation.hydrate(invitation);
    return mongooseInvitation;
  }

  return invitation as undefined | InvitationByLinkId;
}

// export async function _(
//   linkId: undefined | string,
//   options: {
//     additionalMatchFields?: Record<string, string | undefined>;
//     invitationStatus?: invitationStatus | { $or: invitationStatus[] } | { $and: invitationStatus[] } | { $in: invitationStatus[] };
//     hydrate?: boolean;
//   } = {}
// ): Promise<InvitationByLinkId | (InvitationInterface & Document) | undefined> {
//   const invitationStatusPP = options.invitationStatus && [
//     {
//       $match: {
//         status: options.invitationStatus,
//         ...(options.additionalMatchFields || {})
//       }
//     }
//   ];
//   const invitations = await AuthToken.aggregate<InvitationByLinkId | undefined>([...getBasePipelines({ linkId, invitationStatusPP })]).catch(
//     (error) => {
//       error.message = 'error finding invitation';
//       throw new ErrorCustom(error, httpStatus.INTERNAL_SERVER_ERROR);
//     }
//   );
//   const invitation = invitations[0];
//   if (options.hydrate && invitation) {
//     const mongooseInvitation = Invitation.hydrate(invitation);
//     return mongooseInvitation;
//   }

//   return invitation as undefined | InvitationByLinkId;
// }

// const getBasePipelines = ({ linkId, invitationStatusPP }: { linkId: string; invitationStatusPP: InvitationStatusQuery[] }): PipelineStage[] => [
//   {
//     $match: {
//       linkId: linkId
//     }
//   },
//   {
//     $lookup: {
//       from: 'invitations',
//       localField: '_id',
//       foreignField: 'authToken',
//       as: 'invitation',
//       pipeline: [
//         ...(invitationStatusPP || []),
//         {
//           $lookup: {
//             from: 'spaces',
//             localField: 'space',
//             foreignField: '_id',
//             as: 'space'
//           }
//         },
//         { $unwind: '$space' },
//         // {
//         //   $lookup: {
//         //     from: 'units',
//         //     localField: 'unit',
//         //     foreignField: '_id',
//         //     as: 'unit'
//         //   }
//         // },
//         // { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'createdBy',
//             foreignField: '_id',
//             as: 'createdBy'
//           }
//         },
//         { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
//       ]
//     }
//   },
//   {
//     $unwind: { path: '$invitation', preserveNullAndEmptyArrays: true }
//   },
//   {
//     $match: { invitation: { $exists: true, $ne: null } } // again filter out null values. returns empty array if null.
//   },
//   {
//     $replaceRoot: { newRoot: '$invitation' }
//   },
//   {
//     $project: {
//       _id: 1,
//       email: 1,
//       userType: 1,
//       status: 1,
//       createdBy: {
//         name: 1,
//         surname: 1,
//         email: 1
//       },
//       unit: 1,
//       space: {
//         name: 1,
//         _id: 1,
//         address: 1
//       }
//     }
//   }
// ];
