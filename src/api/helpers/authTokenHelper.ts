import AuthToken from '../../models/AuthToken';

import { RequestCustom } from '../../types/custom-express/express-custom';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { _MSG } from '../../utils/messages';
import logger from '../../lib/logger';
import { ObjectId } from 'mongodb';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
/**
 * @description verify pin from request body and return authToken document with populated space
 */
export async function verifyPinFromRequest(req: RequestCustom): Promise<{ verified: boolean; authToken: AuthTokenInterface }> {
  const { linkId, idMongoose } = req.params;
  const { pin } = req.body;
  const data = await AuthToken.findOne({
    linkId,
    _id: idMongoose,
    nonce: pin,
    active: true
  }).populate({ path: 'space', select: 'name organization' });
  const found = data ? true : false;

  return { verified: found, authToken: data };
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

export function checkAuthTokenForError(authToken: AuthTokenInterface) {
  if (!authToken) {
    throw new Error(_MSG.INVALID_ACCESS);
  }
  if (!authToken.active) {
    throw new Error(_MSG.AUTH_TOKEN_EXPIRED);
  }
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
  authToken: AuthTokenInterface
): authToken is AuthTokenInterface & { space: ISpace & { organization: ObjectId } } {
  if (!authToken) {
    throw new Error('pin not verified');
  }
  // if (!isPopulatedSpace(authToken.space)) throw new Error('space is not populated');
  // if (!isObjectIdOrganization(authToken.space.organization)) throw new Error('organization is not ObjectId');
  return true;
}

export async function getInvitationByAuthTokenLinkId(linkId: string) {
  const [invitation] = await AuthToken.aggregate([
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
          {
            $match: {
              status: 'pending'
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
          { $unwind: '$space' },
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
      $replaceRoot: { newRoot: '$invitation' }
    },
    {
      $project: {
        _id: 1,
        email: 1,
        useType: 1,
        createdBy: {
          name: 1,
          surname: 1,
          email: 1
        },
        space: {
          name: 1,
          _id: 1,
          address: 1
        }
      }
    }
  ]);
  return invitation as {
    _id: ObjectId;
    email: string;
    userType: RoleName;
    createdBy: { email: string; surname: string; name: string };
    space: { _id: ObjectId; name: string; address: string };
  };
}
