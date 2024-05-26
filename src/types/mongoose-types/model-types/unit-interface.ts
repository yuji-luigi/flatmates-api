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
  status: UnitStatus;
}
export const unitStatus = ['complete-registration', 'idle', 'registration-pending'] as const;
/** idle means unit exists but no invitation is present. No user is pending to register to the unit at the moment */
export type UnitStatus = (typeof unitStatus)[number];
