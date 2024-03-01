import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { ISpace } from './space-interface';
import { IUser } from './user-interface';
import { RoleFields, RoleInterface } from './role-interface';
import { Model } from 'mongoose';
// enities
// threads, maintenances, comments, users, spaces, roles
export const permissions = [
  'canCreatePost',
  'canCreateMaintenance',
  'canNotifyMaintainer',
  'canDeletePost',
  'canDeleteMaintenance',
  'canDeleteComment'
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

export interface AccessControllerBase extends MongooseBaseModel {
  user: ObjectId | IUser;
  space: ObjectId | ISpace;
  role: ObjectId | RoleInterface;
  isSystemAdmin: boolean;
  isSubSystemAdmin: boolean;
  permissions: PermissionInterface[];
}

export interface AccessControllerInterface extends AccessControllerBase {
  getCacheKey: () => string;
  getCachedPermission: () => boolean | undefined;
  cachePermission: () => void;
  checkPermissionWithCache: () => boolean;
}

export interface AccessControllerStatics {
  buildPermissionFields: (dto: ACtrlDtoDashboard) => PermissionInterface[];
}
export type AccessControllerModel = Model<AccessControllerInterface, object, AccessControllerStatics> & AccessControllerStatics;
