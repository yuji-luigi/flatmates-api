import { CurrentSpace, ReqUser } from './jwtTypings';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-permission-interface';
import { roleCache } from '../mongoose/mongoose-cache/role-cache';

export const reqUserBuilder = ({
  user,
  currentSpace,
  was,
  loggedAs,
  accessPermissions,
  currentAccessController
}: {
  user: UserBase;
  currentSpace: CurrentSpace;
  was?: RoleFields;
  accessPermissions: AccessPermissionCache[];
  currentAccessController?: AccessPermissionCache;
  loggedAs: RoleFields;
}): ReqUser => {
  const currentRole = roleCache.get(loggedAs);
  const prevRole = roleCache.get(was);
  const jwtReturnObject: ReqUser = {
    ...user,
    currentSpace,
    accessPermissions,
    currentAccessController,
    loggedAs: currentRole,
    was: prevRole
  };
  return jwtReturnObject;
};
