import httpStatus from 'http-status';
import Role from '../../../models/Role';
import { RoleName, RoleInterface } from '../../../types/mongoose-types/model-types/role-interface';
import { ErrorCustom } from '../../ErrorCustom';
/**
 * @description key is Name of role
 *  */
export const roleCache = new Map<RoleName, RoleInterface>();

export const initCacheRole = async () => {
  const roles = await Role.find();
  roles.forEach((role) => {
    roleCache.set(role.name, role);
  });
};

export class RoleCache {
  static get maintainer() {
    if (roleCache.get('maintainer') === undefined) {
      throw new ErrorCustom('Cache is not initialized yet for some reason', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return roleCache.get('maintainer') as RoleInterface;
  }
  static get property_manager() {
    if (roleCache.get('property_manager') === undefined) {
      throw new ErrorCustom('Cache is not initialized yet for some reason', httpStatus.INTERNAL_SERVER_ERROR);
    }

    return roleCache.get('property_manager') as RoleInterface;
  }
  static get inhabitant() {
    if (roleCache.get('inhabitant') === undefined) {
      throw new ErrorCustom('Cache is not initialized yet for some reason', httpStatus.INTERNAL_SERVER_ERROR);
    }

    return roleCache.get('inhabitant');
  }
  static get system_admin() {
    if (roleCache.get('system_admin') === undefined) {
      throw new ErrorCustom('Cache is not initialized yet for some reason', httpStatus.INTERNAL_SERVER_ERROR);
    }

    return roleCache.get('system_admin') as RoleInterface;
  }
}
