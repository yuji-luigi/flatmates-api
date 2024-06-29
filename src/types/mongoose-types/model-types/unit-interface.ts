import { MongooseBaseModel } from './base-types/base-model-interface';
import { ObjectId } from 'mongodb';

export interface UnitInterface extends MongooseBaseModel {
  name: string;
  ownerName: string;
  tenantName?: string;
  unitSpace: ObjectId;
  /**building and palazzo (condominium?) */
  space: ObjectId;
  /**wing, section, scala*/
  wing: ObjectId;
  /** piano */
  floor: ObjectId;
  owner?: ObjectId;
  tenant?: ObjectId;
  status: UnitStatus;
  user?: ObjectId;
}
// TODO: unitStatus: idle is not meaningful name.
export const unitStatus = ['complete-registration', 'idle', 'registration-pending'] as const;
/** idle means unit exists but no invitation is present. No user is pending to register to the unit at the moment */
export type UnitStatus = (typeof unitStatus)[number];
