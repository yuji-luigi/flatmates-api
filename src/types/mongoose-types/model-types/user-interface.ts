// import { Model } from 'mongoose';
// import { IUserSetting } from './UserSetting';

import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { LoginInstance, LoginInstanceMethods, tokenGeneratePayload } from '../../universal-mongoose-model/user-base-interface';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { RoleInterface } from './role-interface';
export type UserError = {
  status?: number;
  isPublic?: boolean;
  message?: string;
};

export interface IUser extends UserBase, LoginInstance<IUser>, MongooseBaseModel {
  // tailSpace: ISpace | string;
  passwordMatches: (password: string) => Promise<boolean>;
  token: () => string;
  save: () => void;
}

export interface UserBase extends UserBaseOptionalPassword {
  password: string;
}

export interface UserBaseOptionalPassword {
  _id: ObjectId;
  name: string;
  surname?: string | undefined;
  email?: string;
  password: undefined | string;
  avatar?: IUpload;
  phone?: string | undefined;
  isSuperAdmin: boolean;
  slug: string;
  role: ObjectId | RoleInterface;
  adminOf: ISpace[];
  active: boolean;
  cover?: IUpload;
  _update?: {
    password?: Buffer | string;
  };
}

export interface IUserStatics {
  testType: (notExist: string) => Error;
  findAndGenerateToken: (body: tokenGeneratePayload) => Promise<{
    user: IUser;
    // user: IUser;
    accessToken: string;
  }>;
  // other static methods here
}

export interface UserModel extends Model<IUser, object, IUserStatics>, LoginInstanceMethods<IUser> {}
