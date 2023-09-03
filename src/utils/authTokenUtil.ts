import jwt from 'jsonwebtoken';
import vars from '../config/vars';
import { AuthTokenInterface } from '../types/mongoose-types/model-types/auth-token-interface';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';
import { IUser } from '../types/mongoose-types/model-types/user-interface';
const baseUrl = vars.frontendUrl + '/auth-tokens';

export const generateTokenUrl = {
  userRegister: (authToken: AuthTokenInterface) => `${baseUrl}/users/${authToken.linkId}/${authToken._id.toString()}`
};

export const signJwt = (payload: string | Record<string, any>) => jwt.sign(payload, vars.jwtSecret, { expiresIn: vars.jwtExpirationInterval });

type JsonObjPayload = {
  space?: ISpace | null;
  user?: IUser | null;
};

export const createJsonObject = (payload: JsonObjPayload) => ({
  email: payload.user?.email,
  spaceName: payload?.space.name,
  spaceId: payload?.space._id.toString(),
  organizationId: payload.space?.organization.toString()
});
