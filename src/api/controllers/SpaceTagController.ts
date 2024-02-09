import { Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../lib/logger';

import { deleteEmptyFields } from '../../utils/functions';
import { RequestCustom } from '../../types/custom-express/express-custom';
import SpaceTag from '../../models/SpaceTag';
import Maintenance from '../../models/Maintenance';
import AuthToken from '../../models/AuthToken';
const entity = 'checks';

export const createSpaceTag = async (req: RequestCustom, res: Response) => {
  try {
    // get req.params.entity

    req.body = deleteEmptyFields(req.body);
    const { isGlobal, name } = req.body;
    const spaceTag = new SpaceTag(req.body);

    //! Todo: handle this in frontend.
    // return sendCrudObjectsWithPaginationToClient(req, res);

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      data: spaceTag,
      count: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};
