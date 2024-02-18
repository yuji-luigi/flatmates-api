import jwt from 'jsonwebtoken';
import vars, { basicCookieOptions, sensitiveCookieOptions } from '../../utils/globalVariables';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { Response } from 'express';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { JsonObjPayload, JwtSignPayload, SpaceDataInCookieFull, SpaceDetails } from './jwtTypings';
const baseUrl = vars.frontendUrl + '/auth-tokens';

export const generateTokenUrl = {
  userRegister: (authToken: AuthTokenInterface) => `${baseUrl}/users/${authToken.linkId}/${authToken._id.toString()}`
};

export const signJwt = (payload: string | Record<string, any>) => jwt.sign(payload, vars.jwtSecret, { expiresIn: vars.jwtExpirationInterval });

export const createJWTObjectFromJWTAndSpace = (payload: JsonObjPayload): JwtSignPayload => {
  let spaceData: SpaceDataInCookieFull | null = null;
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
  const data: JwtSignPayload = {
    email: payload.user?.email,
    loggedAs: payload.user?.loggedAs,
    ...spaceData
  };
  return data;
};
/** @description sign payload as jwt then res.cookie with type checking. set jwt and space + organization cookie*/
export function handleSetCookiesFromPayload(res: Response, payload: JwtSignPayload) {
  res.cookie('jwt', signJwt(payload), sensitiveCookieOptions);
  if (hasSpaceDetails(payload)) {
    res.cookie('spaceId', payload.spaceId, basicCookieOptions);
    res.cookie('spaceName', payload.spaceName, basicCookieOptions);
    res.cookie('spaceSlug', payload.spaceSlug, basicCookieOptions);
    res.cookie('spaceAddress', payload.spaceAddress, basicCookieOptions);
    res.cookie('spaceImage', payload.spaceImage);
  }
}
/**
 * @description sign payload({spaceId, spaceImage...etc}) then res.cookie with type checking. set jwt and space + organization cookie*/
export function handleSetCookiesFromSpace(res: Response, space: ISpace) {
  res.cookie('spaceId', space._id, basicCookieOptions);
  res.cookie('spaceName', space.name, basicCookieOptions);
  res.cookie('spaceSlug', space.slug, basicCookieOptions);
  res.cookie('spaceAddress', space.address, basicCookieOptions);
  res.cookie('organizationId', space.organization, basicCookieOptions);
  res.cookie('spaceImage', space.cover?.url);
}

function hasSpaceDetails(payload: JwtSignPayload): payload is SpaceDetails & JwtSignPayload {
  if ('spaceId' in payload) {
    return payload.spaceId !== undefined;
  }
}

export function resetSpaceCookies(res: Response) {
  res.clearCookie('spaceId', { domain: vars.cookieDomain });
  res.clearCookie('spaceName', { domain: vars.cookieDomain });
  res.clearCookie('spaceSlug', { domain: vars.cookieDomain });
  res.clearCookie('spaceAddress', { domain: vars.cookieDomain });
  res.clearCookie('organizationId', { domain: vars.cookieDomain });
}

export const signLoginInstanceJwt = (payload: JwtSignPayload) => {
  return jwt.sign(payload, vars.jwtSecret, {
    expiresIn: vars.jwtExpirationInterval // expires in 24 hours
  });
};
