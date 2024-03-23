import { UserByRole } from './UserByRole';

export class Administrator extends UserByRole {
  protected static roleName = 'administrator' as const;
}
