import Role from '../../../models/Role';
import { RoleFields, RoleInterface } from '../../../types/mongoose-types/model-types/role-interface';
/**
 * @description key is Name of role
 *  */
export const roleCache = new Map<RoleFields, RoleInterface>();

export const initCacheRole = async () => {
  const roles = await Role.find();
  roles.forEach((role) => {
    roleCache.set(role.name, role);
  });
};
