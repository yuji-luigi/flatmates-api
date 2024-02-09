import { Document } from 'mongoose';
import { RoleFields, RoleInterface } from '../../types/mongoose-types/model-types/role-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import AccessController from '../../models/AccessController';
type RoleTypeMap = {
  inhabitant: RoleInterface['inhabitant'];
  maintainer: RoleInterface['maintainer'];
  administrator: RoleInterface['administrator'];
};

/**
 * @description check the organizations and rootSpaces length of the role to see if the user can login
 */
export const isValidLogin = async <T extends RoleFields>({ user, loggedAs }: { user: Document & IUser; loggedAs: T }): Promise<boolean> => {
  if (user.isSuperAdmin) return true;
  const roleType = role[loggedAs] as RoleTypeMap[T];
  const accessController = await AccessController.findOne({ user: user._id, role: roleType._id });
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
