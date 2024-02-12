import { LeanUser } from '../../types/mongoose-types/model-types/user-interface';
import { CurrentSpace, ReqUser } from './jwtTypings';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import Role from '../../models/AccessController';

export const reqUserBuilder = async (leanUser: LeanUser, currentSpace: CurrentSpace, loggedAs: RoleFields): Promise<ReqUser> => {
  // AccessController takes the place of Role
  const accessController = { rootSpaces: [], organizations: [] };
  if (!leanUser.isSuperAdmin && !accessController.organizations.map((id) => id.toString())?.includes(currentSpace.organizationId.toString())) {
    throw new Error('User is not part of the organization');
  }
  const jwtReturnObject: ReqUser = {
    ...leanUser,
    ...currentSpace,
    // spaces and organizations should be single.
    // organization might not be present any more.
    rootSpaces: accessController.rootSpaces,
    organizations: accessController.organizations,
    loggedAs,
    isSuperAdmin: leanUser.isSuperAdmin
  };
  return jwtReturnObject;
  // }
};
// deprecate
export const _old_reqUserBuilder = async (leanUser: LeanUser, currentSpace: CurrentSpace, loggedAs: RoleFields): Promise<ReqUser> => {
  // Here TypeScript will infer the correct type based on the entity discriminator
  // if (loggedAs === 'inhabitant') {
  const role = await Role.findById(leanUser.role);
  const currentRole = role[loggedAs];
  if (!user.isSuperAdmin && !currentRole.organizations.map((id) => id.toString())?.includes(currentSpace.organizationId.toString())) {
    throw new Error('User is not part of the organization');
  }
  const jwtReturnObject: ReqUser = {
    ...leanUser,
    ...currentSpace,
    rootSpaces: currentRole.rootSpaces,
    organizations: currentRole.organizations,
    loggedAs,
    isSuperAdmin: user.isSuperAdmin
  };
  return jwtReturnObject;
  // }
};
