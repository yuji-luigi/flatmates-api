// import { Model } from 'mongoose';
// import { IUserSetting } from './UserSetting';

import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { LoginInstance, LoginInstanceMethods, tokenGeneratePayload } from '../../universal-mongoose-model/user-base-interface';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
export type UserError = {
  status?: number;
  isPublic?: boolean;
  message?: string;
};

type userRoles = 'user' | 'admin' | 'super_admin';
export interface IUser extends LoginInstance<IUser>, MongooseBaseModel {
  name: string | undefined;
  surname: string | undefined;
  email?: string | undefined;
  password: string;
  avatar?: IUpload;
  phone?: string | undefined;
  /** will be only super_admin and user. will use adminOf field to check if user is admin of an space.
   */
  role?: userRoles;
  // need to put the control when user is created/updated
  adminOf: ISpace[] | [];
  // wallet?: string;
  // userSetting: string | boolean;
  rootSpaces?: ISpace[] | [];
  active: boolean;
  // organization?: IOrganization | null | undefined;
  organizations?: IOrganization[] | [];
  cover: IUpload;
  _update?: {
    password?: Buffer | string;
  };
  last_login?: Date;
  // tailSpace: ISpace | string;
  passwordMatches: (password: string) => boolean;
  // hasOrganization: (organizationId: string) => Promise<boolean>;
  token: () => string;
  save: () => void;
  getOrganizations: () => Promise<IOrganization[]>;
  isSuperAdmin: () => boolean;
  isAdminOrganization: (organizationId: ObjectId) => Promise<boolean>;
}

export interface IUserStatics {
  findAndGenerateToken: (body: tokenGeneratePayload) => Promise<{
    user: IUser;
    // user: IUser;
    accessToken: string;
  }>;
  // other static methods here
}

export interface UserModel extends Model<IUser, object, IUserStatics>, LoginInstanceMethods<IUser> {}

export type LeanUser = Omit<IUser, 'passwordMatches' | 'token' | 'save' | 'getOrganizations' | 'isSuperAdmin' | 'isAdminOrganization'>;
