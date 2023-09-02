import { ObjectId } from 'mongoose';
import { LoginInstanceEntities } from './Entities';
import { MongooseBaseModel } from './base-types/base-model-interface';

export interface AuthTokenInterface extends MongooseBaseModel {
  nonce: number;
  linkId: string;
  active: boolean;
  docHolder: {
    ref: LoginInstanceEntities;
    instanceId: ObjectId | string;
  };
}
