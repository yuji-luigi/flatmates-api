import { ObjectId } from 'bson';

export interface LoginInstance<UserType> extends LoginInstanceMethods<UserType> {
  _id: ObjectId;
  name: string;
  surname?: string;
  email: string;
  password: string;
}

export interface LoginInstanceMethods<UserType> {
  token: () => string;
  passwordMatches: (password: string) => boolean;
  findAndGenerateToken: (body: tokenGeneratePayload) => Promise<{
    user: UserType;
    accessToken: string;
  }>;
}
// abstract class LoginInstanceMethods {
//   token: () => string;
//   passwordMatches: (password: string) => boolean;
//   findAndGenerateToken: <UserType>(body: tokenGeneratePayload) => Promise<{
//     user: UserType;
//     accessToken: string;
//   }>;
// }

export type tokenGeneratePayload = {
  email: string;
  password: string;
  refreshObject: any;
};
