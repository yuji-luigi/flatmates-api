import jwt from 'jsonwebtoken';
import vars from '../../config/vars';
import { LoginInstanceProperties } from '../../types/universal-mongoose-model/user-base-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { MaintainerInterface } from '../../types/mongoose-types/model-types/maintainer-interface';

const { jwtSecret /* , jwtExpirationInterval  */ } = vars;

export function handleGenerateToken({ maintainer, user }: { maintainer?: MaintainerInterface; user: IUser }) {
  if (maintainer) {
    return generateTokenMaintainer(maintainer);
  }
  if (user) {
    return generateTokenUser(user);
  }
  throw new Error('Login instance not recognized');
}

//users
export function generateTokenUser(user: IUser) {
  const payload = {
    email: user.email,
    organizationId: user.organizations[0]?._id.toString()
  };
  return jwt.sign(payload, jwtSecret, {
    expiresIn: '24h' // expires in 24 hours
  });
}

// maintainers
export function generateTokenMaintainer(maintainer: MaintainerInterface) {
  const payload = {
    email: maintainer.email,
    entity: 'maintainers'
    // organizationId: maintainer.organizations[0]?._id.toString()
  };
  return jwt.sign(payload, jwtSecret, {
    expiresIn: '24h' // expires in 24 hours
  });
}
