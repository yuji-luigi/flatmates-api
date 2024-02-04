import { IUser, IUserStatics } from '../../types/mongoose-types/model-types/user-interface';
import { MaintainerInterface } from '../../types/mongoose-types/model-types/maintainer-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { JwtSignPayload } from '../../lib/jwt/jwtUtils-types';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { ReqUser } from '../../lib/jwt/jwtTypings';

// const { jwtSecret /* , jwtExpirationInterval  */ } = vars;
// !deprecating
export function handleGenerateToken({ maintainer, user }: { maintainer?: MaintainerInterface; user: IUser }) {
  if (maintainer) {
    return generatePayloadMaintainer({ maintainer });
  }
  if (user) {
    return generatePayloadUser(user);
  }
  throw new Error('Login instance not recognized');
}

export async function handleGenerateTokenByRoleAtLogin({
  selectedRole,
  user
}: {
  selectedRole: RoleFields;
  user: Document<unknown, object, IUser> &
    Omit<
      IUser &
        Required<{
          _id: ObjectId;
        }>,
      'findAndGenerateToken'
    > &
    IUserStatics;
}): Promise<JwtSignPayload> {
  // if (user.role[selectedRole].populated()()
  if (user.role instanceof ObjectId) {
    throw new Error('Role not populated');
  }
  return {
    loggedAs: selectedRole,
    email: user.email,
    ...(user.role.isSuperAdmin ? {} : { organizationId: user.role[selectedRole].organizations[0].toString() })
  };
}
export function handleGenerateTokenByRoleAfterLogin(user: ReqUser): JwtSignPayload {
  // if (user.role[selectedRole].populated()()

  return {
    loggedAs: user.loggedAs,
    email: user.email
    // ...(user.role.isSuperAdmin ? {} : { organizationId: user.role[selectedRole].organizations[0].toString() })
  };
}

//users
export function generatePayloadUser(user: IUser) {
  const payload: JwtSignPayload = {
    loggedAs: 'inhabitant',
    email: user.email,
    organizationId: user.organizations[0]?._id.toString()
  };
  return payload;
  // return signLoginInstanceJwt(payload);
  // return jwt.sign(payload, jwtSecret, {
  //   expiresIn: vars.jwtExpirationInterval // expires in 24 hours
  // });
}

// todo to be deprecated
export function generatePayloadMaintainer({
  maintainer,
  organizationId,
  spaceId,
  space
}: {
  organizationId?: string;
  maintainer: MaintainerInterface;
  spaceId?: string;
  space?: ISpace;
}) {
  let payload: JwtSignPayload = {
    email: maintainer.email,
    loggedAs: 'maintainer',
    organizationId,
    spaceId
  };
  if (space) {
    payload = {
      ...payload,
      spaceImage: space.cover?.url,
      spaceName: space.name,
      spaceSlug: space.slug,
      spaceAddress: space.address
    };
  }
  return payload;
  // return signLoginInstanceJwt(payload);
}
