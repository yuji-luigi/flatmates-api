import express from 'express';
import { SUPER_ADMIN } from '../../middlewares/auth-middlewares';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import {
  postResourceIntoStorage,
  postMaintenanceFileToStorage,
  deleteFileFromStorageAndEntity,
  deleteAll,
  getAllUploads
} from '../controllers/UploadFilesController';
import { queryHandler } from '../../middlewares/handleSetQuery';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';

const router = express.Router();
// this is public
router.post('/maintenance-file', postMaintenanceFileToStorage);

router.use(handleUserFromRequest);
router.use(queryHandler);

router.post('/', postResourceIntoStorage);
router.post('/:entity', postResourceIntoStorage);
router.delete('/:modelEntity/:modelId/:uploadKey/:uploadId', deleteFileFromStorageAndEntity);
router.delete('/delete-all', isLoggedIn([SUPER_ADMIN]), deleteAll);
router.get('/all', isLoggedIn([SUPER_ADMIN]), getAllUploads);

export default router;
