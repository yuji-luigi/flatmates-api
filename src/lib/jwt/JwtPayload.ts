import { ObjectId } from 'mongodb';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
import { JwtSignPayload } from './jwtTypings';

export class JWTPayload implements JwtSignPayload {
  email: string;
  loggedAs: RoleName;
  userType?: RoleName;
  spaceId?: string;
  accessControllerId?: string;

  constructor({ email, loggedAs, spaceId, userType }: { email: string; loggedAs: RoleName; spaceId: string | ObjectId; userType: RoleName }) {
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
    loggedAs: RoleName;
    spaceId?: string | ObjectId;
    userType: RoleName;
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
