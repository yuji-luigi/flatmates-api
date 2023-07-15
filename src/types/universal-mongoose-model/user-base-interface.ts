import { MaintainerInterface } from '../mongoose-types/model-types/maintainer-interface';
import { IUser } from '../mongoose-types/model-types/user-interface';

export interface LoginInstance extends LoginInstanceMethods {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface LoginInstanceMethods {
  token: () => string;
  passwordMatches: (password: string) => boolean;
  findAndGenerateToken: <UserType>(body: tokenGeneratePayload) => Promise<{
    user: UserType;
    accessToken: string;
  }>;
}

export type tokenGeneratePayload = {
  email: string;
  password: string;
  refreshObject: any;
};
