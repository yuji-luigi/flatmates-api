import { MongooseBaseModel } from './base-types/base-model-interface';
import { ObjectId } from 'mongodb';

export interface UnitInterface extends MongooseBaseModel {
  name: string;
  ownerName: string;
  mateName?: string;
  unitSpace: ObjectId;
  space: ObjectId;
  owner?: ObjectId;
  mate?: ObjectId;
}
