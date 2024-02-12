import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { ISpace } from './space-interface';
import { IUser } from './user-interface';
import { RoleInterface } from './role-interface';
// enities
// threads, maintenances, comments, users, spaces, roles
export const permissions = [
  'canDeleteMaintenance',
  'canNotifyMaintainer',
  'canDeleteComment',
  'canDeleteThread',
  'canCreateThread',
  'canCreateMaintenance'
];
export type Permission = (typeof permissions)[number];
export interface PermissionInterface {
  name: string;
  allowed: boolean;
}

export interface AccessControllerInterface extends MongooseBaseModel, AccessControllerMethods {
  user: ObjectId | IUser;
  rootSpace: ObjectId | ISpace;
  role: ObjectId | RoleInterface;
  permissions: PermissionInterface[];
}
export interface AccessControllerMethods {
  getCacheKey: () => string;
  getCachedPermission: () => boolean | undefined;
  cachePermission: () => void;
  checkPermissionWithCache: () => boolean;
}
