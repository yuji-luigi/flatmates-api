import { MongooseBaseModel } from './base-types/base-model-interface';

export const roles = ['inhabitant', 'maintainer', 'administrator', 'system_admin'] as const;
export type RoleFields = (typeof roles)[number];
export interface RoleInterface extends MongooseBaseModel {
  name: RoleFields;
}

export function isRoleField(key: any): key is RoleFields {
  return roles.includes(key);
}
