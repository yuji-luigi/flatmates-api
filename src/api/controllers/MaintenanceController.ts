import { SUPER_ADMIN } from '../../middlewares/auth-middlewares';
import Maintenance from '../../models/Maintenance';
import httpStatus from 'http-status';
import logger from '../../config/logger';
import { Request, Response } from 'express';
import { deleteEmptyFields } from '../../utils/functions';
import { getFileDirName, saveInStorage, separateFiles } from '../helpers/uploadFileHelper';
import Upload from '../../models/Upload';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { sendEmail } from '../helpers/nodemailerHelper';
import { IMaintenance } from '../../types/mongoose-types/model-types/maintenance-interface';
import { createOptionsForMaintenance } from '../helpers/maintenanceHelper';
import { IUpload } from '../../types/mongoose-types/model-types/upload-interface';
import { sensitiveCookieOptions } from '../../config/vars';
import { _MSG } from '../../utils/messages';
import { aggregateWithPagination } from '../helpers/mongoose.helper';
import AuthToken from '../../models/AuthToken';
import Check from '../../models/Check';
import Maintainer from '../../models/Maintainer';
import { generatePayloadMaintainer } from '../../utils/login-instance-utils/generateTokens';
import { getIdString } from '../../utils/type-guard/mongoose/stringOrMongooseObject';
import { handleSetCookiesFromSpace, signLoginInstanceJwt } from '../../lib/jwt/jwtUtils';
/**
 * POST CONTROLLERS
 */

interface UploadFields {
  [key: string]: IUpload[];
  images: IUpload[];
  attachments: IUpload[];
}

const entity = 'maintenances';

export const sendMaintenancesWithPaginationToClient = async (req: RequestCustom, res: Response) => {
  try {
    // const limit = 10;

    //  TODO: use req.query for querying in find method and paginating. maybe need to delete field to query in find method
    const { query } = req;

    const data = await aggregateWithPagination(query, entity);

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (err) {
    res.status(err).json({
      message: err.message || err
    });
  }
};

const createMaintenance = async (req: RequestCustom, res: Response) => {
  try {
    const reqBody = deleteEmptyFields(req.body);
    reqBody.createdBy = req.user;
    reqBody.organization = req.query.organization;
    reqBody.space = req.query.space;

    const maintenance = new Maintenance(reqBody);
    const authToken = new AuthToken({
      space: maintenance.space,
      docHolder: {
        ref: 'maintenances',
        instanceId: maintenance._id
      }
    });
    const images = await Upload.find({ _id: { $in: maintenance.images } });
    maintenance.images = images;

    //!todo send email to the maintainers of the space of type of maintenance
    //!todo log the email
    await maintenance.save();
    await authToken.save();
    const mailOptions = await createOptionsForMaintenance({ maintenance, authToken });
    if (mailOptions) {
      await sendEmail(mailOptions);
    }
    const maintenances = await Maintenance.find(req.query).sort({ createdAt: -1 });
    for (const maintenance of maintenances) {
      for (const image of maintenance.images) {
        await image.setUrl();
      }
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'maintenances',
      data: maintenances,
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};
const updateMaintenance = async (req: RequestCustom, res: Response) => {
  try {
    req.body.createdBy = req.user;
    const reqBody = deleteEmptyFields<IMaintenance>(req.body);
    if (req.files) {
      const [filesToUpload] = separateFiles(req.files);
      const generalDirName = await getFileDirName(req);
      const uploadModelsData = await saveInStorage(filesToUpload, generalDirName);
      const uploads: UploadFields = { images: [], attachments: [] };

      //!todo send push notification to the user of the space
      //!todo send email based on the logs to the maintainers of the space of type of maintenance

      for (const key in uploadModelsData) {
        const data = uploadModelsData[key];
        const createdModel = await Upload.create(data);
        // uploadModelIds.push(createdModel._id.toString());
        uploads[data.fieldInParent].push(createdModel);
      }
      reqBody.images = uploads.images;
      reqBody.attachments = uploads.attachments;
    }
    // const uploadModelIds = existingFilesId;
    const newThread = await Maintenance.create(reqBody);
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'posts',
      data: newThread,
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};

const sendMaintenancesToFrondEnd = async (req: Request, res: Response) => {
  try {
    const maintenances = await Maintenance.find(req.query).sort({
      isImportant: -1,
      createdAt: -1
    });
    if (maintenances.length) {
      for (const thread of maintenances) {
        await thread.setStorageUrlToModel();
      }
    }
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'posts',
      data: maintenances,
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};

const sendMaintenancesForHomeDashboard = async (req: RequestCustom, res: Response) => {
  try {
    const maintenances = await Maintenance.find(req.query).limit(10);

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'maintenances',
      data: maintenances,
      totalDocuments: 1
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: _MSG.ERRORS.GENERIC
    });
  }
};

const sendSingleMaintenanceToFrondEnd = async (req: Request, res: Response) => {
  try {
    const maintenance = await Maintenance.findById(req.params.maintenanceId);
    if (maintenance) {
      await maintenance.setStorageUrlToModel();
    }
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'maintenances',
      data: maintenance,
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};
const deleteThread = async (req: RequestCustom, res: Response) => {
  try {
    const maintenance = await Maintenance.findById(req.params.maintenanceId);
    // user check
    if (req.user.role === SUPER_ADMIN || req.user._id?.toString() === maintenance?.createdBy._id.toString() || maintenance.space) {
      await maintenance?.handleDeleteUploads();
      await Maintenance.findByIdAndDelete(req.params.maintenanceId);
    }

    const maintenances = await Maintenance.find(req.query).sort({
      isImportant: -1,
      createdAt: -1
    });
    if (maintenances.length) {
      for (const maintenance of maintenances) {
        await maintenance.setStorageUrlToModel();
      }
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'maintenances',
      data: maintenances,
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
};

export async function checkIsActiveMaintainerFromClient(req: RequestCustom, res: Response) {
  try {
    const { linkId, idMongoose } = req.params;
    const authToken = await AuthToken.findOne({ linkId, _id: idMongoose, nonce: req.body.pin });
    if (!authToken) throw new Error('pin is not correct');
    res.cookie('maintenanceNonce', req.body.pin, sensitiveCookieOptions);

    const maintenance = await Maintenance.findById(authToken.docHolder.instanceId).populate({ path: 'space', populate: { path: 'admins' } });
    const maintainer = await Maintainer.findById(maintenance.maintainer);
    if (maintainer.active && maintainer.password) {
      res.send(httpStatus.OK).json({
        success: true,
        collection: 'authTokens',
        message: 'maintainer is active and password is set',
        data: maintainer
      });
    }

    res.cookie('maintenanceNonce', req.body.pin, sensitiveCookieOptions);
    // not throw error but success false
    res.status(httpStatus.OK).json({
      success: false,
      collection: 'authTokens',
      message: 'maintainer is not active or password is not set',
      data: maintainer,
      maintenance
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
}

export async function authUserMaintenanceFiles(req: Request, res: Response) {
  try {
    const { linkId, idMongoose } = req.params;
    const authToken = await AuthToken.findOne({ linkId, _id: idMongoose, nonce: req.body.pin });

    if (!authToken) throw new Error('pin is not correct');
    res.cookie('maintenanceNonce', req.body.pin, sensitiveCookieOptions);
    const maintenance = await Maintenance.findById(authToken.docHolder.instanceId)
      .populate({ path: 'organization', select: 'name' })
      .populate({
        path: 'space',
        select: 'name address admins cover',
        populate: [
          {
            path: 'cover',
            select: 'url'
          },
          {
            path: 'admins', // this will populate 'admins' in 'space'
            select: 'name surname email avatar',
            populate: 'avatar' // assuming you want to populate name and email of admins, adjust accordingly
          }
        ]
      });
    // todo!!
    const organizationId = getIdString(maintenance.organization);
    const spaceId = getIdString(maintenance.space);
    const maintainer = await Maintainer.findById(maintenance.maintainer);
    const token = generatePayloadMaintainer({ maintainer, organizationId, spaceId, space: maintenance.space });
    console.log(sensitiveCookieOptions);
    handleSetCookiesFromSpace(res, maintenance.space);
    res.cookie('jwt', token, sensitiveCookieOptions);

    const checks = await Check.find({ maintenance: maintenance.space._id }).populate('organization');
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'maintenances',
      data: { message: 'pin is correct', maintenance, checks },
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
}

export async function authUserMaintenanceByJWT(req: Request, res: Response) {
  try {
    const { linkId, idMongoose } = req.params;
    const authToken = await AuthToken.findOne({ linkId, _id: idMongoose, nonce: req.body.pin });

    if (!authToken) throw new Error('pin is not correct');
    res.cookie('maintenanceNonce', req.body.pin, sensitiveCookieOptions);
    const maintenance = await Maintenance.findById(authToken.docHolder.instanceId)
      .populate({ path: 'organization', select: 'name' })
      .populate({
        path: 'space',
        select: 'name address admins cover',
        populate: [
          {
            path: 'cover',
            select: 'url'
          },
          {
            path: 'admins', // this will populate 'admins' in 'space'
            select: 'name surname email avatar',
            populate: 'avatar' // assuming you want to populate name and email of admins, adjust accordingly
          }
        ]
      });
    // todo!!
    const organizationId = getIdString(maintenance.organization);
    const spaceId = getIdString(maintenance.space);
    const maintainer = await Maintainer.findById(maintenance.maintainer);
    const payload = generatePayloadMaintainer({ maintainer, organizationId, spaceId, space: maintenance.space });
    const token = signLoginInstanceJwt(payload);
    handleSetCookiesFromSpace(res, maintenance.space);
    res.cookie('jwt', token, sensitiveCookieOptions);

    const checks = await Check.find({ maintenance: maintenance.space._id }).populate('organization');
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'maintenances',
      data: { message: 'pin is correct', maintenance, checks },
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
}

// export const { createMaintenance } = postController;
const postController = {
  createMaintenance,
  updateMaintenance,
  sendMaintenancesToFrondEnd,
  sendSingleMaintenanceToFrondEnd,
  deleteThread,
  sendMaintenancesForHomeDashboard
};
export default postController;
