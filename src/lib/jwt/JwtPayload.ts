import { ObjectId } from 'bson';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { JwtSignPayload } from './jwtTypings';

export class JWTPayload implements JwtSignPayload {
  email: string;
  loggedAs: RoleFields;
  userType?: RoleFields;
  spaceId?: string;
  accessControllerId?: string;

  constructor({ email, loggedAs, spaceId, userType }: { email: string; loggedAs: RoleFields; spaceId: string | ObjectId; userType: RoleFields }) {
    if (userType === 'system_admin') {
      throw new Error('system_admin cannot be set as userType in JWT payload');
    }
    this.email = email;
    this.loggedAs = loggedAs;
    this.spaceId = spaceId.toString();
    this.userType = userType;
  }

  static simple({
    email,
    loggedAs,
    spaceId,
    userType
  }: {
    email: string;
    loggedAs: RoleFields;
    spaceId?: string | ObjectId;
    userType: RoleFields;
  }): JWTPayload {
    if (spaceId instanceof ObjectId) {
      spaceId = spaceId.toString();
    }
    if (userType === 'system_admin') {
      throw new Error('system_admin cannot be set as userType in JWT payload');
    }
    return {
      email,
      loggedAs,
      userType,
      spaceId
    };
  }
}
