import Organization from '../models/Organization';
import { RequestCustom } from '../types/custom-express/express-custom';
import { NextFunction, Response } from 'express';

type RequestWithOrganization = RequestCustom<unknown, unknown, { organization: string }, { organization: string }>;

// export const handleQueryOld = async (req: RequestWithOrganization, res: Response, next: NextFunction): Promise<void> => {
//   const { user } = req;

//   if (user.role === 'super_admin') {
//     return next();
//   }
//   if (!user.organization) {
//     const globalOrganization = await Organization.findOne({ name: 'users_without_organization', isPublic: true });
//     req.query.organization = globalOrganization._id.toString();
//     return next();
//   }
//   req.query.organization = user.organization._id;
//   return next();
// };

// const setBody = async (req: RequestWithOrganization, res: Response, next: NextFunction) => {
//   const { user } = req;
//   if (user.role === 'super_admin') {
//     return next();
//   }
//   if (!user.organization) {
//     const globalOrganization = await Organization.findOne({ name: 'users_without_organization', isPublic: true });
//     req.body.organization = globalOrganization._id.toString();
//     return next();
//   }
//   req.body.organization = user.organization._id;
//   return next();
// };

// export const handleOrganization =
//   () =>
//   async (req: RequestWithOrganization, res: Response, next: NextFunction): Promise<void> => {
//     if (!req.user) {
//       return next();
//     }
//     if (req.method === 'POST') {
//       return await setBody(req, res, next);
//     }
//     if (req.method === 'GET') {
//       return handleQuery(req, res, next);
//     }
//     return next();
//   };
