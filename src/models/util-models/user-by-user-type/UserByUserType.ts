import { Maintainer } from './Maintainer';
import { PropertyManager } from './PropertyManager';
import { Inhabitant } from './Inhabitants';

// could be an object with a key for each user type
export class UserByUserType {
  static get maintainers() {
    return Maintainer;
  }
  static get property_managers() {
    return PropertyManager;
  }
  static get inhabitants() {
    return Inhabitant;
  }
}
