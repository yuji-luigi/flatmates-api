import { AbstractUserByUserType } from './AbstractUserByUserType';

export class Inhabitant extends AbstractUserByUserType {
  protected static roleName = 'inhabitant' as const;
}
