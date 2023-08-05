import { AuthTokenInterface } from './auth-token-interface';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUser } from './user-interface';

export interface UnitInterface extends MongooseBaseModel {
  name: string;
  surname: string;
  email?: string;
  authToken: AuthTokenInterface;
  mainSpace: ISpace;
  tailSpace: ISpace | string;
  organization?: string | IOrganization;
  user: IUser;
}
