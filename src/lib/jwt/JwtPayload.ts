import { ObjectId } from 'bson';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { JwtSignPayload } from './jwtTypings';

export class JWTPayload implements JwtSignPayload {
  email: string;
  loggedAs: RoleFields;
  was?: RoleFields;
  spaceId?: string;
  accessControllerId?: string;

  constructor({ email, loggedAs, spaceId, was }: { email: string; loggedAs: RoleFields; spaceId: string | ObjectId; was?: RoleFields }) {
    this.email = email;
    this.loggedAs = loggedAs;
    this.spaceId = spaceId.toString();
    this.was = was;
  }

  static simple({ email, loggedAs, spaceId }: { email: string; loggedAs: RoleFields; spaceId?: string | ObjectId }): JWTPayload {
    if (spaceId instanceof ObjectId) {
      spaceId = spaceId.toString();
    }
    return {
      email,
      loggedAs,
      spaceId
    };
  }
}
