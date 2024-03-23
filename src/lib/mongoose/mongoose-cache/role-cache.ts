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

export class RoleCache {
  static get maintainer() {
    return roleCache.get('maintainer');
  }
  static get administrator() {
    return roleCache.get('administrator');
  }
  static get inhabitant() {
    return roleCache.get('inhabitant');
  }
}
