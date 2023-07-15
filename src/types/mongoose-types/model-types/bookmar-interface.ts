import { MongooseBaseModel } from './base-types/base-model-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';

export interface IBookmark extends MongooseBaseModel {
  date?: string | undefined;
  entity: string | undefined;
  refId: string;
  note?: string | undefined;
  mainSpace?: ISpace;
  organization: IOrganization;
}
