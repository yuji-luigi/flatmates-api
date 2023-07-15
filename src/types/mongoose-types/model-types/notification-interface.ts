import { MongooseBaseModel } from './base-model-interface';
import { IOrganization } from './organization-interface';

export interface INotification extends MongooseBaseModel {
  title?: string;
  body: string;
  organization: IOrganization;
}
