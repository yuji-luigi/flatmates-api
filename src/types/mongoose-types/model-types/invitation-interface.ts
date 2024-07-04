import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { RoleName } from './role-interface';

/** accepted and completed-register meaning end of life cycle of the invitation (new field acceptedAt) */
export const invitationStatuses = ['pending', 'accepted', 'declined', 'outdated', 'pending-register', 'completed-register'] as const;
export const invitationStatusEnum = invitationStatuses.reduce((acc, status) => {
  acc[status] = status;
  return acc;
}, {} as Record<invitationStatus, invitationStatus>);

export const invitationTypes = ['qrcode', 'via-email'] as const;

export type InvitationType = (typeof invitationTypes)[number];
export type invitationStatus = (typeof invitationStatuses)[number];

export interface _InvitationInterface extends MongooseBaseModel {
  email: string;
  cell?: string;
  userType: RoleName;
  type: InvitationType;
  status: invitationStatus;
  space: ObjectId;
  createdBy: ObjectId;
  authToken: ObjectId;
  unit?: ObjectId;
  displayName?: string;
  acceptedAt?: Date;
}

export type InvitationInterface = _InvitationInterface | InhabitantInvitationInterface | PropertyManagerMaintainerInvitationInterface;
// export type InvitationInterface = InhabitantInvitationInterface | PropertyManagerMaintainerInvitationInterface;

interface InhabitantInvitationInterface extends _InvitationInterface {
  userType: 'inhabitant';
  unit: ObjectId;
}

interface PropertyManagerMaintainerInvitationInterface extends _InvitationInterface {
  userType: 'property_manager' | 'maintainer';
  email: string;
  unit?: undefined;
}
