import { ObjectId } from 'mongodb';

export interface MongooseBaseModel {
  _id: ObjectId;
  createdAt: string;
  updatedAt: string;
  // organization?: IOrganization | string;
  setStorageUrlToModel?: () => Promise<void>;
}
