import { ObjectId } from 'mongodb';
// Define a type that either resolves to the methods or an empty object
export type ConditionalMethods<UserType> = UserType extends null ? NonNullable<unknown> : LoginInstanceMethods<UserType>;
export interface LoginInstance<UserType = null> extends LoginInstanceMethods<UserType>, LoginInstanceProperties {}
export interface LoginInstanceProperties {
  _id: ObjectId;
  name: string;
  surname?: string;
  email: string;
  password: string;
  active: boolean;
  lastLogin?: Date;
}

export interface LoginInstanceMethods<UserType> {
  token: () => string;
  passwordMatches: (password: string) => Promise<boolean>;
  findAndGenerateToken: (body: tokenGeneratePayload) => Promise<{
    user: UserType;
    accessToken: string;
  }>;
  findAndGenerateTokenWithoutError: (body: tokenGeneratePayload) => Promise<{
    user: UserType;
    accessToken: string;
  }>;
}

export type tokenGeneratePayload = {
  email: string;
  password: string;
  refreshObject: any;
};
