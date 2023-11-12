import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { MaintainerInterface } from '../../types/mongoose-types/model-types/maintainer-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { JwtSignPayload } from '../jwt/jwtUtils-types';
import { signLoginInstanceJwt } from '../jwt/jwtUtils';

// const { jwtSecret /* , jwtExpirationInterval  */ } = vars;

export function handleGenerateToken({ maintainer, user }: { maintainer?: MaintainerInterface; user: IUser }) {
  if (maintainer) {
    return generateTokenMaintainer({ maintainer });
  }
  if (user) {
    return generateTokenUser(user);
  }
  throw new Error('Login instance not recognized');
}

//users
export function generateTokenUser(user: IUser) {
  const payload: JwtSignPayload = {
    entity: 'users',
    email: user.email,
    organizationId: user.organizations[0]?._id.toString()
  };
  return signLoginInstanceJwt(payload);
  // return jwt.sign(payload, jwtSecret, {
  //   expiresIn: vars.jwtExpirationInterval // expires in 24 hours
  // });
}

// maintainers
export function generateTokenMaintainer({
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
    entity: 'maintainers',
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
