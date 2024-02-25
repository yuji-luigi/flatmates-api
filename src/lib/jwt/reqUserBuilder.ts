import { CurrentSpace, ReqUser } from './jwtTypings';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { AccessControllerInterface } from '../../types/mongoose-types/model-types/access-controller-interface';
import { roleCache } from '../mongoose/mongoose-cache/role-cache';

export const reqUserBuilder = async ({
  user,
  currentSpace,
  loggedAs,
  accessControllers
}: {
  user: UserBase;
  currentSpace: CurrentSpace;
  accessControllers: AccessControllerInterface[];
  loggedAs: RoleFields;
}): Promise<ReqUser> => {
  // AccessController takes the place of Role
  const currentRole = roleCache.get(loggedAs);
  const jwtReturnObject: ReqUser = {
    ...user,
    currentSpace,
    accessControllers,
    loggedAs: currentRole
  };
  return jwtReturnObject;
  // }
};
