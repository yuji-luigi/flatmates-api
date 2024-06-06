import { NextFunction, Request, Response } from 'express';
import AuthToken from '../../models/AuthToken';
import Unit from '../../models/Unit';
import httpStatus from 'http-status';

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
            { $match: { $expr: { $eq: ['$unit', '$$unitId'] } } }
            // {
            //   $lookup: {
            //     from: 'authtokens',
            //     localField: 'authToken',
            //     foreignField: '_id',
            //     as: 'authToken'
            //   }
            // }
            // {
            //   $unwind: {
            //     path: '$authToken',
            //     preserveNullAndEmptyArrays: true
            //   }
            // }
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
          ownerName: 1,
          tenantName: 1,
          status: 1,
          space: {
            name: 1,
            address: 1
          },
          authToken: { $ifNull: ['$authToken', null] }
        }
      }
    ]);
    console.log(JSON.stringify(units, null, 2));

    res.status(httpStatus.OK).json({
      data: units,
      success: true
    });
  } catch (error) {
    next(error);
  }
}
