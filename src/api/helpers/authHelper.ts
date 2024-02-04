import { RoleFields, RoleInterface } from '../../types/mongoose-types/model-types/role-interface';
type RoleTypeMap = {
  inhabitant: RoleInterface['inhabitant'];
  maintainer: RoleInterface['maintainer'];
  administrator: RoleInterface['administrator'];
};

/**
 * @description check the organizations and rootSpaces length of the role to see if the user can login
 */
export const isValidLogin = <T extends RoleFields>({ role, loggedAs }: { role: RoleInterface; loggedAs: T }): boolean => {
  if (role.isSuperAdmin) return true;
  const roleType = role[loggedAs] as RoleTypeMap[T];
  return accessChecksByRole[loggedAs](roleType);
};

const accessChecksByRole: {
  [K in RoleFields]: (currentRole: RoleTypeMap[K]) => boolean;
} = {
  inhabitant: (currentRole: RoleInterface['inhabitant']) => {
    if (!currentRole.organizations.length || !currentRole.rootSpaces.length) {
      return false;
    }
    return true;
  },
  maintainer: (currentRole: RoleInterface['maintainer']) => {
    if (!currentRole.organizations.length || !currentRole.rootSpaces.length) {
      return false;
    }
    return true;
  },
  administrator: (currentRole: RoleInterface['administrator']) => {
    if (!currentRole.organizations.length) {
      return false;
    }
    return true;
  }
};
