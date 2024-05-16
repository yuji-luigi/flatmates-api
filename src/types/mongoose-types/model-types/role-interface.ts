import { MongooseBaseModel } from './base-types/base-model-interface';

//  TODO: ELIMINATE ROLE COLLECTION AND USE THIS ROLES AS USERTYPE.
// TODO:  CHANGE ALL ACCESS_PERMISSIONS.ROLES TO BE  ROLE.NAME
// TODO: ROLE WILL BE USER TYPE
export const roles = [
  {
    name: 'inhabitant',
    label: 'Inhabitant'
  },
  {
    name: 'maintainer',
    label: 'Maintainer'
  },
  {
    name: 'property_manager',
    label: 'Property Manager'
  },
  {
    name: 'system_admin',
    label: 'System Admin'
  },
  {
    name: 'super_admin',
    label: 'Super Admin'
  }
] as const;

export type RoleName = (typeof roles)[number]['name'];

export interface RoleInterface extends MongooseBaseModel {
  name: RoleName;
  label: string;
}

export function isRoleField(key: any): key is RoleName {
  return roles.map((role) => role.name).includes(key);
}
