import { RoleCache } from '../../../lib/mongoose/mongoose-cache/role-cache';
import { AbstractUserByUserType } from './AbstractUserByUserType';
console.log(RoleCache.maintainer); // console.log(RoleCache.maintainer);
export class Maintainer extends AbstractUserByUserType {
  protected static roleName = 'maintainer' as const;
}
