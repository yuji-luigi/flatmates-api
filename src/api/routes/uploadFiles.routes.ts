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

const router = express.Router();

router.post('/', postResourceIntoStorage);
router.post('/maintenance-file', postMaintenanceFileToStorage);
router.post('/:entity', postResourceIntoStorage);
router.delete('/:modelEntity/:modelId/:uploadKey/:uploadId', deleteFileFromStorageAndEntity);
router.delete('/delete-all', isLoggedIn([SUPER_ADMIN]), deleteAll);
router.get('/all', isLoggedIn([SUPER_ADMIN]), getAllUploads);

export default router;
