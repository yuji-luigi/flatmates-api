import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { RoleName } from './role-interface';

/** accepted and completed-register meaning end of life cycle of the invitation (new field acceptedAt)
 * expired is when unit displayName is changed and invitation is not accepted yet.
 *
 */
export const invitationStatuses = ['pending', 'accepted', 'declined', 'expired', 'pending-email-verification', 'completed-register'] as const;
export const invitationStatusEnum = invitationStatuses.reduce((acc, status) => {
  acc[status] = status;
  return acc;
}, {} as Record<invitationStatus, invitationStatus>);

export const pendingInvitationStatuses = invitationStatuses.filter((status) => status.split('-')[0] === 'pending');

export const invitationTypes = ['qrcode', 'via-email'] as const;

export type InvitationType = (typeof invitationTypes)[number];
export type invitationStatus = (typeof invitationStatuses)[number];

export interface _InvitationInterface extends MongooseBaseModel {
  email: string;
  cell?: string;
  /** used to save the userType to save. also to switch in register/login by invitation logic.(invitations routes) */
  userType: RoleName;
  /** is not being used. If we use it will be used with user type and type nested switch.*/
  type: InvitationType;
  status: invitationStatus;
  space: ObjectId;
  createdBy: ObjectId;
  authToken: ObjectId;
  unit?: ObjectId;
  displayName?: string;
  acceptedAt?: Date;
  deletedAt?: Date;
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
