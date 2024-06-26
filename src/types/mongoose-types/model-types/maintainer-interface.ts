import { ObjectId } from 'mongodb';
import { LoginInstance } from '../../universal-mongoose-model/user-base-interface';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';

export interface MaintainerInterface extends Omit<LeanMaintainer, 'entity' | 'role'>, MongooseBaseModel, LoginInstance<MaintainerInterface> {}

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
