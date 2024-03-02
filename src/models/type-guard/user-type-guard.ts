import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';

export function getPopulatedRoleField({ role, user }: { role: RoleFields; user: IUser }) {
  // if (user.role instanceof ObjectId) {
  //   throw new Error('Role not populated');
  // }
  // if(role === 'inhabitant') {
  //   return user.role[role] as ;
  // }s
}
