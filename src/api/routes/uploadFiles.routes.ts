import express from 'express';
import { isLoggedIn, SUPER_ADMIN } from '../../middlewares/auth';
import uploadFileController from '../controllers/UploadFilesController';

const router = express.Router();

router.post('/', uploadFileController.postResourceIntoStorage);
router.post('/maintenance-file', uploadFileController.postMaintenanceFileToStorage);
router.post('/:entity', uploadFileController.postResourceIntoStorage);
router.delete('/:modelEntity/:modelId/:uploadKey/:uploadId', uploadFileController.deleteFileFromStorageAndEntity);
router.delete('/delete-all', isLoggedIn([SUPER_ADMIN]), uploadFileController.deleteAll);

export default router;
