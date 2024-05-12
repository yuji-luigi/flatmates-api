import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { RoleName } from './role-interface';

export const invitationStatuses = ['pending', 'accepted', 'declined'] as const;

export type invitationStatus = (typeof invitationStatuses)[number];
export interface InvitationInterface extends MongooseBaseModel {
  email: string;
  cell?: string;
  userType: RoleName;
  status: invitationStatus;
  space: ObjectId;
  createdBy: ObjectId;
  authToken: ObjectId;
}
