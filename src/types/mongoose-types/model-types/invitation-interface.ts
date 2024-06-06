import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { RoleName } from './role-interface';

export const invitationStatuses = ['pending', 'accepted', 'declined', 'outdated'] as const;

export type invitationStatus = (typeof invitationStatuses)[number];

export interface _InvitationInterface extends MongooseBaseModel {
  email: string;
  cell?: string;
  userType: RoleName;
  status: invitationStatus;
  space: ObjectId;
  createdBy: ObjectId;
  authToken: ObjectId;
  unit?: ObjectId;
  displayName?: string;
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
