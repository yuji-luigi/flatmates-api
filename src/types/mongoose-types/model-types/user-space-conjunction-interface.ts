import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';

export interface UserSpaceConjunction extends MongooseBaseModel {
  space: ObjectId;
  user: ObjectId;
}
