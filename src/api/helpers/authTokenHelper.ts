import AuthToken from '../../models/AuthToken';

import { RequestCustom } from '../../types/custom-express/express-custom';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';

export async function verifyPinFromRequest(req: RequestCustom): Promise<{ verified: boolean; authToken: AuthTokenInterface }> {
  const { linkId, idMongoose } = req.params;
  const { pin } = req.body;
  const data = await AuthToken.findOne({
    linkId,
    _id: idMongoose,
    nonce: pin,
    active: true
  });
  const found = data ? true : false;

  return { verified: found, authToken: data };
}

/**
 * @description stringify _id and linkId of authToken document. !!includes nonce!! */
export function stringifyAuthToken(authToken: AuthTokenInterface): string {
  const object = {
    _id: authToken._id,
    linkId: authToken.linkId,
    nonce: authToken.nonce
  };
  return JSON.stringify(object);
}

/**
 * @description find authToken from cookie. !!includes nonce!!
 */
export async function findAuthTokenFromCookie(cookie: string) {
  const { _id, linkId, nonce } = JSON.parse(cookie);
  const foundToken = await AuthToken.findOne({
    _id,
    linkId,
    nonce,
    used: false
  });
  // if (!foundToken) {
  //   throw new Error(_MSG.INVALID_ACCESS);
  // }
  return foundToken;
}
