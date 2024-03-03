import { CurrentSpace, ReqUser } from './jwtTypings';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-controller-interface';
import { roleCache } from '../mongoose/mongoose-cache/role-cache';

export const reqUserBuilder = async ({
  user,
  currentSpace,
  loggedAs,
  accessPermissions,
  currentAccessController
}: {
  user: UserBase;
  currentSpace: CurrentSpace;
  accessPermissions: AccessPermissionCache[];
  currentAccessController?: AccessPermissionCache;
  loggedAs: RoleFields;
}): Promise<ReqUser> => {
  const currentRole = roleCache.get(loggedAs);
  const jwtReturnObject: ReqUser = {
    ...user,
    currentSpace,
    accessPermissions,
    currentAccessController,
    loggedAs: currentRole
  };
  return jwtReturnObject;
};
