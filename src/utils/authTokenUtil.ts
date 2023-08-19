import vars from '../config/vars';
import { AuthTokenInterface } from '../types/mongoose-types/model-types/auth-token-interface';

const baseUrl = vars.frontendUrl + '/auth-tokens';

export const generateTokenUrl = {
  userRegister: (authToken: AuthTokenInterface) => `${baseUrl}/users/${authToken.linkId}/${authToken._id.toString()}`
};
