import { ObjectId } from 'bson';
import { LoginInstanceEntities } from './Entities';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { ISpace } from './space-interface';

export interface AuthTokenInterface extends MongooseBaseModel {
  nonce: number;
  linkId: string;
  active: boolean;
  userSpaceConjunction: ObjectId;
  // space: ObjectId | ISpace;
  // docHolder: {
  //   ref: LoginInstanceEntities;
  //   instanceId: ObjectId | string;
  // };
}
