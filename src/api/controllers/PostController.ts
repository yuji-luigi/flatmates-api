import { SUPER_ADMIN } from '../../middlewares/auth-middlewares';
import Thread from '../../models/Thread';
import httpStatus from 'http-status';
import logger from '../../lib/logger';
import { Request, Response } from 'express';
import { deleteEmptyFields, getEntity } from '../../utils/functions';
import { getFileDirName, saveInStorage, separateFiles } from '../helpers/uploadFileHelper';
import Upload from '../../models/Upload';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { getThreadsForPlatForm } from '../helpers/mongoose.helper';
import mongoose from 'mongoose';
import { UploadsThread } from '../helpers/types-uploadFileHelper';
import { _MSG } from '../../utils/messages';

const createThread = async (req: RequestCustom, res: Response) => {
  try {
    req.body.createdBy = req.user;
    const reqBody = deleteEmptyFields(req.body);

    reqBody.organization = req.user.organizationId;
    reqBody.space = req.user.spaceId;
    reqBody.user = req.user;
    await Thread.create(reqBody);
    delete req.query.organizations;
    delete req.query.rootSpaces;
    const threadsToSend = await getThreadsForPlatForm({ entity: 'threads', query: req.query, sortQuery: { isImportant: -1, createdAt: -1 } });
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'posts',
      data: threadsToSend,
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
const updateThread = async (req: RequestCustom, res: Response) => {
  try {
    const { threadId } = req.params;
    const entity = 'threads';
    const foundModel = await mongoose.model(entity).findById(threadId);

    if (req.files) {
      const [filesToUpload] = separateFiles(req.files);
      const generalDirName = await getFileDirName(req);
      const uploadModelsData = await saveInStorage(filesToUpload, generalDirName);
      const uploads: UploadsThread = { images: [], attachments: [] };

      for (const key in uploadModelsData) {
        const data = uploadModelsData[key];
        const createdModel = await Upload.create(data);
        // upl adModelIds.push(createdModel._id.toString());
        uploads[data.fieldInParent].push(createdModel);
      }
      req.body.images = uploads.images;
      req.body.attachments = uploads.attachments;
    }

    delete req.body.organization;

    foundModel.set(req.body);
    await foundModel.save();

    // const uploadModelIds = existingFilesId;
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'threads',
      data: foundModel,
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

const sendThreadsToFrondEnd = async (req: Request, res: Response) => {
  try {
    const threads = await Thread.find(req.query).sort({
      isImportant: -1,
      createdAt: -1
    });
    if (threads.length) {
      for (const thread of threads) {
        await thread.setStorageUrlToModel();
      }
    }
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'posts',
      data: threads,
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

const sendSingleThreadToFrondEnd = async (req: Request, res: Response) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    if (thread) {
      await thread.setStorageUrlToModel();
    }
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'thread',
      data: thread,
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
    const thread = await Thread.findById(req.params.threadId);
    // user check
    if (req.user.role === SUPER_ADMIN || req.user._id?.toString() === thread?.createdBy._id.toString() || thread.space) {
      await thread?.handleDeleteUploads();
      await Thread.findByIdAndDelete(req.params.threadId);
    }

    const threads = await Thread.find(req.query).sort({
      isImportant: -1,
      createdAt: -1
    });
    if (threads.length) {
      for (const thread of threads) {
        await thread.setStorageUrlToModel();
      }
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'threads',
      data: threads,
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

/** generic to threads and maintenances */

const sendPostsToFrondEnd = async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity || getEntity(req.url);
    const Model = mongoose.model(entity);
    const threads = await Model.find(req.query).sort({
      isImportant: -1,
      createdAt: -1
    });
    if (threads.length) {
      for (const thread of threads) {
        await thread.setStorageUrlToModel();
      }
    }
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      data: threads,
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

const sendPostsForHomeDashboard = async (req: RequestCustom, res: Response) => {
  try {
    const threads = await Thread.find(req.query).limit(10);

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'threads',
      data: threads,
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

const sendSinglePostToFrondEnd = async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity || getEntity(req.url);
    const Model = mongoose.model(entity);
    const post = await Model.findById(req.params.postId);
    if (post) {
      await post.setStorageUrlToModel?.();
    }
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: entity,
      data: post,
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
// export const { createThread } = postController;
const postController = {
  createThread,
  updateThread,
  sendThreadsToFrondEnd,
  sendSingleThreadToFrondEnd,
  deleteThread,
  sendSinglePostToFrondEnd,
  sendPostsToFrondEnd,
  sendPostsForHomeDashboard
};
export default postController;
