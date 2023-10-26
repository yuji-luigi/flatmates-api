import { JwtReturnType } from '../../config/resolveJwt';
import jwt from 'jsonwebtoken';
import vars, { basicCookieOptions, sensitiveCookieOptions } from '../../config/vars';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { Response } from 'express';
import { JsonObjPayload, JwtSignPayload, SpaceDataType, SpaceDetails } from './jwtUtils-types';
const baseUrl = vars.frontendUrl + '/auth-tokens';

export const generateTokenUrl = {
  userRegister: (authToken: AuthTokenInterface) => `${baseUrl}/users/${authToken.linkId}/${authToken._id.toString()}`
};

export const formatUserDataForJwt = (user: JwtReturnType) => ({
  email: user.email
});

export const signJwt = (payload: string | Record<string, any>) => jwt.sign(payload, vars.jwtSecret, { expiresIn: vars.jwtExpirationInterval });

export const createJWTObjectFromJWTAndSpace = (payload: JsonObjPayload): JwtSignPayload => {
  let spaceData: SpaceDataType | null = null;
  spaceData = payload.space
    ? {
        spaceName: payload.space.name,
        spaceId: payload.space._id.toString(),
        spaceSlug: payload.space.slug,
        spaceAddress: payload.space.address,
        organizationId: payload.space?.organization.toString(),
        spaceImage: payload.space.cover?.url
      }
    : null;

  spaceData = payload.organizationId ? { ...spaceData, organizationId: payload.organizationId } : spaceData;
  const data = {
    email: payload.user?.email,
    ...spaceData
  };
  // return  signJwt(data);
  return data;
};
/** @description sign payload as jwt then res.cookie with type checking. set jwt and space + organization cookie*/
export function handleSetCookies(res: Response, payload: JwtSignPayload) {
  res.cookie('jwt', signJwt(payload), sensitiveCookieOptions);
  if (hasSpaceDetails(payload)) {
    res.cookie('spaceId', payload.spaceId, basicCookieOptions);
    res.cookie('spaceName', payload.spaceName, basicCookieOptions);
    res.cookie('spaceSlug', payload.spaceSlug, basicCookieOptions);
    res.cookie('spaceAddress', payload.spaceAddress, basicCookieOptions);
    res.cookie('organizationId', payload.organizationId, basicCookieOptions);
    res.cookie('spaceImage', payload.spaceImage);
  }
}

function hasSpaceDetails(payload: JwtSignPayload): payload is SpaceDetails & { email: string; organizationId?: string } {
  return (payload as SpaceDetails).spaceId !== undefined;
}

export function resetSpaceCookies(res: Response) {
  res.clearCookie('spaceId', { domain: vars.cookieDomain });
  res.clearCookie('spaceName', { domain: vars.cookieDomain });
  res.clearCookie('spaceSlug', { domain: vars.cookieDomain });
  res.clearCookie('spaceAddress', { domain: vars.cookieDomain });
  res.clearCookie('organizationId', { domain: vars.cookieDomain });
}