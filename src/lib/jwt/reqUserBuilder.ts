import { LeanUser } from '../../types/mongoose-types/model-types/user-interface';
import { CurrentSpace, ReqUser } from './jwtTypings';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import Role from '../../models/Role';

export const reqUserBuilder = async (leanUser: LeanUser, currentSpace: CurrentSpace, loggedAs: RoleFields): Promise<ReqUser> => {
  // Here TypeScript will infer the correct type based on the entity discriminator
  // if (loggedAs === 'inhabitant') {
  const role = await Role.findById(leanUser.role);
  const currentRole = role[loggedAs];
  if (!role.isSuperAdmin && !currentRole.organizations.map((id) => id.toString())?.includes(currentSpace.organizationId.toString())) {
    throw new Error('User is not part of the organization');
  }
  const jwtReturnObject: ReqUser = {
    ...leanUser,
    ...currentSpace,
    rootSpaces: currentRole.rootSpaces,
    organizations: currentRole.organizations,
    loggedAs,
    isSuperAdmin: role.isSuperAdmin
  };
  return jwtReturnObject;
  // }
};
