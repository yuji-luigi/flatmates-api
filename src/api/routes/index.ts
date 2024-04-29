import express from 'express';

const router = express.Router();

import crudRoutes from './crud.routes';
import authRoutes from './auth.routes';
import customRoutes from './crud.custom.routes';
import uploadFilesRoutes from './uploadFiles.routes';
import threadRoutes from './thread.routes';
import spaceRoutes from './space.routes';
import checkRoutes from './check.routes';
import notificationRoutes from './notification.routes';
import authTokenRoutes from './auth-token.routes';
import organizationRoutes from './organization.routes';
import maintainerRoutes from './maintainer.routes';
import userByTypeRoutes from './userByUserType.routes';
import accessControllerRoutes from './access-permission.routes';
// import dataTableRoutes from './data-table.routes';
import maintenanceRoutes from './maintenance.routes';
import spaceAuthRoutes from './space-auth.routes';
import userRoutes from './user.routes';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { queryHandler } from '../../middlewares/handleSetQuery';
import statisticRoutes from './statistic.routes';
//= ===============================================================================
// AUTH ROUTES
//= ===============================================================================
router.use('/auth', authRoutes);
router.use('/space-auth', spaceAuthRoutes);
router.use('/auth-tokens', authTokenRoutes);
router.use('/upload-files', uploadFilesRoutes);
router.use('/checks', checkRoutes);
router.use('/statistics', statisticRoutes);

// call passport jwt strategy defined in passport.ts
// set user in req.user
router.((use(handleUserFromRequest);
router.use(queryHandler);

router.use('/accessPermissions', accessControllerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/maintenances', maintenanceRoutes);
router.use('/threads', threadRoutes);
router.use('/spaces', spaceRoutes);
router.use('/organizations', organizationRoutes);
router.use('/users', userRoutes);

router.use('/maintainers', maintainerRoutes);
router.use('/', userByTypeRoutes);

// router.use('/with-pagination', dataTableRoutes);

router.use('/', customRoutes);

//= ===============================================================================
// CRUD ROUTES
//= ===============================================================================
router.use('/', crudRoutes);

export default router;
