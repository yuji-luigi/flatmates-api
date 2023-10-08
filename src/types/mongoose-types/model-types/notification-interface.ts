import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';

export interface INotification extends MongooseBaseModel {
  title?: string;
  body?: string;
  space: ISpace;
  global?: boolean;
  usersId: ObjectId[];
  seen: ObjectId[];
  type: 'maintenances' | 'events' | 'notifications' | 'threads ';
  organization: IOrganization;
}
