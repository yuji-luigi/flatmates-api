import { NextFunction, Request, Response } from 'express';
import Unit from '../../models/Unit';
import httpStatus from 'http-status';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';

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
          pipeline: [{ $match: { $expr: { $eq: ['$unit', '$$unitId'] } } }],
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

export interface AddressInfo {
  name: string;
  address: string;
  state: string;
  postalCode: string;
  cityCode?: string;
  stateCode?: string;
  authToken?: AuthTokenInterface;
}
