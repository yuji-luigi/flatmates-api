import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { RoleFields } from './role-interface';
import { Model } from 'mongoose';

export const permissions = [
  'canCreatePosts',
  'canCreateMaintenances',
  'canNotifyMaintainers',
  'canDeletePosts',
  'canDeleteMaintenances',
  'canDeleteComments',
  // new: these should create view for admin dashboard.
  'canCreateUsers',
  'canDeleteUsers',
  'canCreateSpaces',
  'canAssignMaintainers'
] as const;

export type Permission = (typeof permissions)[number];

export type RolePermissions = {
  [key in Permission]: boolean;
};

export interface PermissionInterface {
  name: string;
  allowed: boolean;
}

export type ACtrlDtoDashboard = {
  space: string;
  roleName: RoleFields;
  user: string;
} & {
  [key in Permission]: boolean;
};

export interface AccessPermissionBase extends MongooseBaseModel {
  user: ObjectId;
  space: ObjectId;
  disabled: boolean;
  role: ObjectId;
  permissions: PermissionInterface[];
}
export interface AccessPermissionCache extends MongooseBaseModel {
  user: ObjectId;
  space: ObjectId;
  role: ObjectId;
  permissions: PermissionInterface[];
}

export interface AccessPermissionInterface extends AccessPermissionBase {
  getCacheKey: () => string;
  getCachedPermission: () => boolean | undefined;
  cachePermission: () => void;
  checkPermissionWithCache: () => boolean;
}

export interface AccessPermissionStatics {
  buildPermissionFields: (dto: ACtrlDtoDashboard) => PermissionInterface[];
}

export type AccessControllerModel = Model<AccessPermissionInterface, object, AccessPermissionStatics> & AccessPermissionStatics;
