import { MongooseBaseModel } from './base-types/base-model-interface';

export const roles = ['Inhabitant', 'Maintainer', 'Administrator'] as const;
export type RoleFields = (typeof roles)[number];
export interface RoleInterface extends MongooseBaseModel {
  name: string;
}

export function isRoleField(key: any): key is RoleFields {
  return roles.includes(key);
}
