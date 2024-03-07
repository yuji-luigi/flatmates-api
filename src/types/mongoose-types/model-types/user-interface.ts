// import { Model } from 'mongoose';
// import { IUserSetting } from './UserSetting';

import { IOrganization } from './organization-interface';
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
export interface UserBase {
  _id: ObjectId;
  name: string | undefined;
  surname?: string | undefined;
  email?: string | undefined;
  password: string;
  avatar?: IUpload;
  phone?: string | undefined;
  isSuperAdmin: boolean;
  slug: string;
  /** will be only super_admin and user. will use adminOf field to check if user is admin of an space.
   */
  role: ObjectId | RoleInterface;
  // role: ObjectId | RoleInterface;
  // need to put the control when user is created/updated
  adminOf: ISpace[];
  // wallet?: string;
  // userSetting: string | boolean;
  active: boolean;
  // organization?: IOrganization | null | undefined;
  cover: IUpload;
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
