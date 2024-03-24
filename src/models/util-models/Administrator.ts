import { UserByRole } from './UserByRole';

export class Administrator extends UserByRole {
  protected static roleName = 'property_manager' as const;
}
