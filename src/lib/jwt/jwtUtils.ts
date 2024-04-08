import jwt from 'jsonwebtoken';
import vars, { basicCookieOptions, sensitiveCookieOptions } from '../../utils/globalVariables';
import { Response } from 'express';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { JWTPayload } from './JwtPayload';
const baseUrl = vars.frontendUrl + '/auth-tokens';

export const generateTokenUrl = {
  userRegister: (authToken: AuthTokenInterface) => `${baseUrl}/users/${authToken.linkId}/${authToken._id.toString()}`
};

export const signJwt = (payload: string | Record<string, any>) => jwt.sign(payload, vars.jwtSecret, { expiresIn: vars.jwtExpirationInterval });

/** @description sign payload as jwt then res.cookie with type checking. set jwt and space + organization cookie*/
export function handleSetCookiesFromPayload(res: Response, payload: JWTPayload, space?: ISpace) {
  res.cookie('jwt', signJwt({ ...payload }), { ...sensitiveCookieOptions, httpOnly: true, sameSite: false });
  res.cookie('loggedAs', payload.loggedAs, basicCookieOptions);
  if (space) {
    res.cookie('spaceId', space._id.toString(), basicCookieOptions);
    res.cookie('spaceName', space.name, basicCookieOptions);
    res.cookie('spaceSlug', space.slug, basicCookieOptions);
    res.cookie('spaceAddress', space.address, basicCookieOptions);
    res.cookie('spaceImage', space.cover?.url, basicCookieOptions);
  }
}

export function resetSpaceCookies(res: Response) {
  res.clearCookie('spaceId', { domain: vars.cookieDomain });
  res.clearCookie('spaceName', { domain: vars.cookieDomain });
  res.clearCookie('spaceSlug', { domain: vars.cookieDomain });
  res.clearCookie('spaceAddress', { domain: vars.cookieDomain });
  res.clearCookie('organizationId', { domain: vars.cookieDomain });
}
