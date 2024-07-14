import { NextFunction, Request, Response } from 'express';
import Unit from '../../models/Unit';
import httpStatus from 'http-status';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { RequestCustomWithUser } from '../../types/custom-express/express-custom';
import { checkUserPermissionOfSpace } from '../../middlewares/isLoggedIn';
import { ObjectId } from 'bson';
import AccessPermission from '../../models/AccessPermission';
import { roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';

export async function sendUnitsWithAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    const spaceId = req.user?.currentSpace?._id;

    const units = await Unit.aggregate([
      {
        $match: {
          space: spaceId
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
      {
        $unwind: {
          path: '$space',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'invitations',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$unit', '$$unitId'] },
                status: { $in: ['pending', 'pending-email-verification'] }
              }
            },
            // TODO: DELETE ALL THE PENDING STATUS AT THE CREATION OF NEW INVITATION IF NOT UPDATE THE EXISTING ONE.(SHOULD BE CREATION OF AUTH TOKEN OR INVITATION.)
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'invitation'
        }
      },
      {
        $unwind: {
          path: '$invitation',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'authtokens',
          localField: 'invitation.authToken',
          foreignField: '_id',
          as: 'authToken'
        }
      },
      {
        $unwind: {
          path: '$authToken',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: 1,
          address: '$space.address',
          ownerName: 1,
          tenantName: 1,
          status: 1,
          postalCode: 'xxx xxxx',
          space: {
            name: 1,
            address: 1
          },
          authToken: {
            $ifNull: [
              {
                _id: '$authToken._id',
                nonce: '$authToken.nonce',
                linkId: '$authToken.linkId',
                active: '$authToken.active'
              },
              null
            ]
          }
        }
      }
    ]);

    res.status(httpStatus.OK).json({
      data: units,
      success: true
    });
  } catch (error) {
    next(error);
  }
}

export async function removeUserFromUnit(req: RequestCustomWithUser, res: Response, next: NextFunction) {
  try {
    const [unit] = await Unit.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.idMongoose)
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
      { $unwind: '$space' }
    ]);
    await checkUserPermissionOfSpace(['system_admin', 'property_manager'], req.user, unit.space._id.toString());

    const updated = await Unit.findOneAndUpdate(
      {
        _id: unit._id
      },
      { $unset: { user: '' } },
      { runValidators: true, new: true }
    ).populate({ path: 'space', select: 'name address' });

    // if there are no other units in the space, remove the accessPermission as inhabitant from the space
    const otherUnits = await Unit.find({ user: req.user?._id, space: unit.space._id });
    if (otherUnits.length === 0) {
      await AccessPermission.deleteMany({ user: req.user?._id, space: unit.space._id, role: roleCache.get('inhabitant')._id });
    }

    res.status(httpStatus.OK).json({
      message: 'User removed from unit',
      data: updated,
      success: true
    });
  } catch (error) {
    next(error);
  }
}
export interface AddressInfo {
  name: string;
  address: string;
  state: string;
  postalCode: string;
  cityCode?: string;
  stateCode?: string;
  authToken?: AuthTokenInterface;
}
