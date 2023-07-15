import { MongooseBaseModel } from './base-types/base-model-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';

export interface MaintainerInterface extends MongooseBaseModel, LoginInstance {
  name: string;
  company: string;
  cover?: IUpload | string;
  avatar?: IUpload;
  homepage: string;
  type: string;
  tel: string;
  email: string;
  logo: IUpload;
  description: string;
  address: string;
  isIndividual: boolean;
  spaces: ISpace[];
  password: string;
  isInSpace: boolean;
  slug: string;
  // organizations: IOrganization[];
  // spaces: ISpaces[];
  createdBy: string | IUser;
}
