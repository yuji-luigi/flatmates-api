import jwt from 'jsonwebtoken';
import vars, { basicCookieOptions, sensitiveCookieOptions } from '../../utils/globalVariables';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { Response } from 'express';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { JwtSignPayload } from './jwtTypings';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { ObjectId } from 'bson';
const baseUrl = vars.frontendUrl + '/auth-tokens';

export const generateTokenUrl = {
  userRegister: (authToken: AuthTokenInterface) => `${baseUrl}/users/${authToken.linkId}/${authToken._id.toString()}`
};

export const signJwt = (payload: string | Record<string, any>) => jwt.sign(payload, vars.jwtSecret, { expiresIn: vars.jwtExpirationInterval });

export class JWTPayload implements JwtSignPayload {
  email: string;
  loggedAs: RoleFields;
  spaceId?: string;
  accessControllerId?: string;

  constructor({
    email,
    loggedAs,
    spaceId,
    accessControllerId
  }: {
    email: string;
    loggedAs: RoleFields;
    spaceId?: string | ObjectId;
    accessControllerId?: string | ObjectId;
  }) {
    this.email = email;
    this.loggedAs = loggedAs;
    this.spaceId = spaceId.toString();
    if (accessControllerId instanceof ObjectId) {
      accessControllerId = accessControllerId.toString();
    }
    this.accessControllerId = accessControllerId;
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

/** @description sign payload as jwt then res.cookie with type checking. set jwt and space + organization cookie*/
export function handleSetCookiesFromPayload(res: Response, payload: JWTPayload, space?: ISpace) {
  res.cookie('jwt', signJwt(payload), sensitiveCookieOptions);
  if (space) {
    res.cookie('spaceId', space._id.toString(), basicCookieOptions);
    res.cookie('spaceName', space.name, basicCookieOptions);
    res.cookie('spaceSlug', space.slug, basicCookieOptions);
    res.cookie('spaceAddress', space.address, basicCookieOptions);
    res.cookie('spaceImage', space.cover?.url, basicCookieOptions);
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

// function hasSpaceDetails(payload: JwtSignPayloadWithAccessCtrlAndSpaceDetail): payload is SpaceDetails & JwtSignPayloadWithAccessCtrlAndSpaceDetail {
//   if ('spaceId' in payload) {
//     return payload.spaceId !== undefined;
//   }
// }

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
