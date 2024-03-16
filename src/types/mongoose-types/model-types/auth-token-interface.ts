import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';

export interface AuthTokenInterface extends MongooseBaseModel {
  nonce: number;
  linkId: string;
  active: boolean;
  space: ObjectId;
  user: ObjectId;
  jwt?: string;
  refEntity: string;
  refId: ObjectId;
}
