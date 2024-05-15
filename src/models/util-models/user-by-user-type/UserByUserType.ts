import { Maintainer } from './Maintainer';
import { PropertyManager } from './PropertyManager';
import { Inhabitant } from './Inhabitants';

// could be an object with a key for each user type
// export const userType = ['maintainers', 'property_managers', 'inhabitants'];
// export type UserType = (typeof userType)[number];
export class UserByUserType {
  static get maintainer() {
    return Maintainer;
  }
  static get property_manager() {
    return PropertyManager;
  }
  static get inhabitant() {
    return Inhabitant;
  }
  static get system_admin() {
    return Inhabitant;
  }
  static get super_admin() {
    return Inhabitant;
  }
}
