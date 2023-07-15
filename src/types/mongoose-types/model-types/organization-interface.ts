import { MongooseBaseModel } from './base-types/base-model-interface';
import { MaintainerInterface } from './maintainer-interface';
import { IUser } from './user-interface';

export interface IOrganization extends MongooseBaseModel {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  homepage: string;
  logo250x60?: string;
  // 300x300
  logoSquare?: string;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  admins: string[] | IUser[];
  maintainers: MaintainerInterface[];
}
