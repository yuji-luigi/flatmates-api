import { UserByRole } from './UserByRole';

export class PropertyManager extends UserByRole {
  protected static roleName = 'property_manager' as const;
}
