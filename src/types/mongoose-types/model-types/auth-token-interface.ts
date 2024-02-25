import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';

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
