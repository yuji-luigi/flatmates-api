import { SUPER_ADMIN } from '../../middlewares/auth';
import Maintenance from '../../models/Maintenance';
import httpStatus from 'http-status';
import logger from '../../config/logger';
import { Request, Response } from 'express';
import { deleteEmptyFields } from '../../utils/functions';
import { createFilesDirName, saveInStorage, separateFiles } from '../helpers/uploadFileHelper';
import Upload from '../../models/Upload';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { sendEmail } from '../helpers/nodemailerHelper';
import { IMaintenance } from '../../types/mongoose-types/model-types/maintenance-interface';
import { createOptionsForMaintenance } from '../helpers/maintenanceHelper';
import { IUpload } from '../../types/mongoose-types/model-types/upload-interface';
import { sensitiveCookieOptions } from '../../config/vars';
/**
 * POST CONTROLLERS
 */

interface UploadFields {
  [key: string]: IUpload[];
  images: IUpload[];
  attachments: IUpload[];
}

const createMaintenance = async (req: RequestCustom, res: Response) => {
  try {
    const reqBody = deleteEmptyFields<IMaintenance>(req.body);
    reqBody.createdBy = req.user;
    reqBody.organization = req.query.organization;
    reqBody.mainSpace = req.query.space;

    const maintenance = await Maintenance.create(reqBody);
    //!todo send email to the maintainers of the space of type of maintenance
    //!todo log the email
    const mailOptions = await createOptionsForMaintenance({ maintenance });
    await sendEmail(mailOptions);

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
      const generalDirName = await createFilesDirName(req.user, req.body.folderName);
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
    if (req.user.role === SUPER_ADMIN || req.user._id?.toString() === maintenance?.createdBy._id.toString() || maintenance.mainSpace) {
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

export async function authUserMaintenanceFiles(req: Request, res: Response) {
  try {
    const { linkId, idMongoose } = req.params;
    const maintenance = await Maintenance.findOne({ linkId, _id: idMongoose, nonce: req.body.pin })
      .populate({ path: 'organization', select: 'name' })
      .populate({ path: 'mainSpace', select: 'name' });
    if (!maintenance) throw new Error('pin is not correct');
    res.cookie('maintenanceNonce', req.body.pin, sensitiveCookieOptions);
    console.log(maintenance.mainSpace);
    console.log(maintenance.organization);
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'maintenances',
      data: { message: 'pin is correct', maintenance },
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
  deleteThread
};
export default postController;
