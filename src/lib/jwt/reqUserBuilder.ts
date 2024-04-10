import { CurrentSpace, ReqUser } from './jwtTypings';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-permission-interface';
import { roleCache } from '../mongoose/mongoose-cache/role-cache';

export const reqUserBuilder = ({
  user,
  currentSpace,
  userType,
  loggedAs,
  accessPermissions,
  currentAccessPermission
}: {
  user: UserBase;
  currentSpace: CurrentSpace;
  userType?: RoleFields;
  accessPermissions: AccessPermissionCache[];
  currentAccessPermission?: AccessPermissionCache;
  loggedAs: RoleFields;
}): ReqUser => {
  const currentRole = roleCache.get(loggedAs);
  const prevRole = roleCache.get(userType);
  const jwtReturnObject: ReqUser = {
    ...user,
    currentSpace,
    accessPermissions,
    currentAccessPermission,
    loggedAs: currentRole,
    userType: prevRole
  };
  return jwtReturnObject;
};
