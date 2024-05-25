import { MongooseBaseModel } from './base-types/base-model-interface';
import { ISpace } from './space-interface';
import { IUser } from './user-interface';
import { ObjectId } from 'mongodb';

export interface UnitInterface extends MongooseBaseModel {
  name: string;
  ownerName: string;
  mateName?: string;
  space: ObjectId;
  condominium: ObjectId;
  owner?: ObjectId;
  mate?: ObjectId;
}
