import { ObjectId } from 'mongodb';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';

export type MaintainerInterface = any;
// export interface MaintainerInterface extends Omit<LeanMaintainer, 'entity' | 'role'>, MongooseBaseModel, LoginInstance<MaintainerInterface> {}

export interface LeanMaintainer {
  _id: ObjectId;
  name: string;
  surname?: string;
  company: string;
  cover?: IUpload | string;
  avatar?: IUpload;
  homepage: string;
  type: string;
  tel: string;
  email?: string;
  logo: IUpload;
  description: string;
  address: string;
  isIndividual: boolean;
  spaces: ObjectId[];
  password: string;
  // isInSpace: boolean; // todo: Why I added this?
  slug: string;
  active: boolean;
  organizations: ObjectId[];
  createdBy: string | IUser;
  entity: 'maintainers'; // excluded in Schema.
  role: 'maintainer'; // excluded in Schema.
}
