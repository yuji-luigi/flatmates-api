import { MongooseBaseModel } from './base-types/base-model-interface';

export const roles = ['inhabitant', 'maintainer', 'property_manager', 'system_admin'] as const;
export type RoleName = (typeof roles)[number];
export interface RoleInterface extends MongooseBaseModel {
  name: RoleName;
  label: string;
}

export function isRoleField(key: any): key is RoleName {
  return roles.includes(key);
}
