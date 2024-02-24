import Role from '../../../models/Role';
import { RoleInterface } from '../../../types/mongoose-types/model-types/role-interface';
/**
 * @description key is Name of role
 *  */
export const roleCache = new Map<string, RoleInterface>();

export const initCacheRole = async () => {
  const roles = await Role.find();
  roles.forEach((role) => {
    roleCache.set(role.name, role);
  });
};