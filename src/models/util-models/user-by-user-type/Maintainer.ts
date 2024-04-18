import { RoleCache } from '../../../lib/mongoose/mongoose-cache/role-cache';
import { AbstractUserByUserType } from './AbstractUserByUserType';
export class Maintainer extends AbstractUserByUserType {
  protected static roleName = 'maintainer' as const;
}
