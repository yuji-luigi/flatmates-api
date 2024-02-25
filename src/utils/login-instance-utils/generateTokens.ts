import { IUser, IUserStatics } from '../../types/mongoose-types/model-types/user-interface';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { JwtSignPayload, ReqUser } from '../../lib/jwt/jwtTypings';

// const { jwtSecret /* , jwtExpirationInterval  */ } = vars;

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
  return {
    loggedAs: selectedRole,
    email: user.email
  };
}
export function handleGenerateTokenByRoleAfterLogin(user: ReqUser): JwtSignPayload {
  // if (user.role[selectedRole].populated()()

  return {
    loggedAs: user.loggedAs.name,
    email: user.email
    // ...(user.isSuperAdmin ? {} : { organizationId: user.role[selectedRole].organizations[0].toString() })
  };
}

//users
export function generatePayloadUser(user: IUser) {
  const payload: JwtSignPayload = {
    loggedAs: 'Inhabitant',
    email: user.email
    // organizationId: user.organizations[0]?._id.toString()
  };
  return payload;
  // return signLoginInstanceJwt(payload);
  // return jwt.sign(payload, jwtSecret, {
  //   expiresIn: vars.jwtExpirationInterval // expires in 24 hours
  // });
}
