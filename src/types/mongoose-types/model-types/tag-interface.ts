import { MongooseBaseModel } from './base-types/base-model-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';

export interface ITag extends MongooseBaseModel {
  name: string;
  description?: string;
  color?: string;
  mainSpace: ISpace;
  organization?: string | IOrganization;
}
