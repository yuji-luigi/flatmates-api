import { CurrentSpace, ReqUser } from './jwtTypings';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
import { UserBaseOptionalPassword } from '../../types/mongoose-types/model-types/user-interface';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-permission-interface';
import { roleCache } from '../mongoose/mongoose-cache/role-cache';
import { ErrorCustom } from '../ErrorCustom';
import { _MSG } from '../../utils/messages';

export const reqUserBuilder = ({
  user,
  currentSpace,
  userType,
  loggedAs,
  accessPermissions,
  currentAccessPermission
}: {
  user: UserBaseOptionalPassword;
  currentSpace: CurrentSpace;
  userType: RoleName | undefined;
  accessPermissions: AccessPermissionCache[];
  currentAccessPermission?: AccessPermissionCache;
  loggedAs: RoleName;
}): ReqUser => {
  if (!userType) {
    throw new ErrorCustom('User type is not defined.', 500);
  }

  const currentRole = roleCache.get(loggedAs);
  const prevRole = roleCache.get(userType);
  if (!currentRole || !prevRole) {
    throw new ErrorCustom(_MSG.ERRORS.GENERIC, 500, 'RoleCache not initialized.');
  }
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
