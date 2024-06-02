import { NextFunction, Request, Response } from 'express';
import AuthToken from '../../models/AuthToken';
import Unit from '../../models/Unit';
import httpStatus from 'http-status';

export async function sendUnitsWithAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    const unitsOfSpace = await Unit.find({
      space: req.user?.currentSpace?._id
    });
    const _ = await Unit.aggregate([
      {
        $lookup: {
          from: 'spaces',
          localField: 'space',
          foreignField: '_id',
          as: 'space'
        }
      },
      {
        $lookup: {
          from: 'spaces',
          localField: 'space',
          foreignField: '_id',
          as: 'space'
        }
      }
    ]);

    const authTokens = await AuthToken.aggregate([
      {
        $lookup: {
          from: 'invitations',
          localField: '_id',
          foreignField: 'authToken',
          as: 'invitation',
          pipeline: [
            {
              $match: {
                // status: status,
                unit: { $in: unitsOfSpace }
              }
            }
          ]
        }
      },
      { $unwind: { path: '$invitation', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          active: 1,
          linkId: 1,
          nonce: 1
        }
      }
    ]);
    res.status(httpStatus.OK).json({
      data: authTokens,
      success: true
    });
  } catch (error) {
    next(error);
  }
}
