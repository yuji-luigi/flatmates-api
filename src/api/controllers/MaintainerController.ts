import Maintainer from '../../models/Maintainer';
import httpStatus from 'http-status';
import logger from '../../config/logger';
import { Response } from 'express';
import { deleteEmptyFields } from '../../utils/functions';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { _MSG } from '../../utils/messages';
import Organization from '../../models/Organization';
import Space from '../../models/Space';

export const createMaintainer = async (req: RequestCustom, res: Response) => {
  try {
    const foundMaintainer = await Maintainer.findOne({ email: req.body.email });
    if (foundMaintainer) {
      throw new Error(_MSG.MAINTAINER_EXISTS);
    }

    req.body.createdBy = req.user;
    const reqBody = deleteEmptyFields<MaintainerInterface>(req.body);
    const newMaintainer = new Maintainer(reqBody);

    const organization = await Organization.findById(req.organization);
    if (organization) {
      organization.maintainers.push(newMaintainer);
      await organization.save();
    }

    const space = await Space.findById(req.space);
    if (space) {
      space.maintainers.push(newMaintainer);
      await space.save();
    }
    await newMaintainer.save();
    const data = await Maintainer.find({ _id: { $in: organization.maintainers } });

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'maintainers',
      data,
      count: data.length
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};

export const sendMaintainersWithPaginationToClient = async (req: RequestCustom, res: Response) => {
  try {
    const entity = 'maintainers';

    // const queryMaintainer = req.space?.maintainers || req.organization?.maintainers;

    const maintainers = await Maintainer.find();
    // const maintainers = await Maintainer.find({ _id: { $in: queryMaintainer } });

    for (const maintainer of maintainers) {
      typeof maintainer.avatar === 'object' && (await maintainer.avatar.setUrl());
      typeof maintainer.cover === 'object' && (await maintainer.cover.setUrl());
    }
    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: maintainers,
      totalDocuments: maintainers.length
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

export default {
  createMaintainer,
  sendMaintainersWithPaginationToClient
};
