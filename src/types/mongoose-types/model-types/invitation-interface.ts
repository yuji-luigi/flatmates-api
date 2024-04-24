import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { RoleName } from './role-interface';
import { AuthTokenInterface } from './auth-token-interface';

export const invitationStatuses = ['pending', 'accepted', 'rejected'] as const;

export interface InvitationInterface extends MongooseBaseModel {
  email: string;
  cell?: string;
  userType: RoleName;
  status: (typeof invitationStatuses)[number];
  space: ObjectId;
  createdBy: ObjectId;
  authToken: ObjectId;
}
