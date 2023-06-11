// import { Model } from 'mongoose';
// import { IUserSetting } from './UserSetting';

type UserError = {
  status?: number;
  isPublic?: boolean;
  message?: string;
};

/** UserModel static methods*/
//  interface UserModel<MongooseModel> extends MongooseModel<IUser> {
//   roles: string[];
//   passwordMatches(password: string): boolean;
//   findAndGenerateToken(body: IUser): {
//     user: UserModel;
//     accessToken: string;
//   };
//   token(): () => string;
//   save(): () => void;
// }

/*
    modules is
*/

type modules =
  | {
      [key: string]: boolean | undefined;
      transports?: boolean | undefined;
      employees?: boolean | undefined;
      apartments?: boolean | undefined;
      worksites?: boolean | undefined;
    }
  | undefined;

/*
    IUser represents what user object has as object without methods and statics.
*/

type userRoles = 'user' | 'admin' | 'super_admin';
interface IUser extends LoginInstance {
  _id: ObjectId;
  avatar?: IUpload;
  name?: string | undefined;
  surname?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  password: string;
  /** will be only super_admin and user. will use adminOf field to check if user is admin of an space.
   */
  role?: userRoles;
  adminOf?: ISpace[] | [];
  bookmarks?: string[]; // consider if populate too much (threads and contents in threads)
  wallet?: string;
  userSetting: string | boolean;
  last_login?: Date;
  rootSpaces?: ISpace[] | [];
  // modules?: modules;
  // organizations: IOrganization[] | [];
  organization: IOrganization | null | undefined;
  cover: IUpload;
  _update?: {
    password?: Buffer | string;
  };
  token(): () => string;
  hasOrganization: (organizationId: string) => Promise<boolean>;
  isAdminOrganization: (organizationId: string) => Promise<boolean>;
  getOrganizations: () => Promise<IOrganization[]>;
  isSuperAdmin: () => boolean;
  passwordMatches: (password: string) => boolean;
  findAndGenerateToken: (body: IUserDocument) => Promise<{
    user: UserModel;
    accessToken: string;
  }>;
  /*   roles: string[] | any;
   */
}
