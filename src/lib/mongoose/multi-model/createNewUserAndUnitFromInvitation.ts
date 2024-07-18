import { invitationStatusEnum } from '../../../types/mongoose-types/model-types/invitation-interface';
import { InvitationByLinkId } from '../../../api/helpers/authTokenHelper';
import AccessPermission from '../../../models/AccessPermission';
import Invitation from '../../../models/Invitation';
import Unit from '../../../models/Unit';
import { InvitationInterface } from '../../../types/mongoose-types/model-types/invitation-interface';
import { IUser } from '../../../types/mongoose-types/model-types/user-interface';
import { RoleCache } from '../mongoose-cache/role-cache';
import { ErrorCustom } from '../../ErrorCustom';
import { Document } from 'mongoose';

export async function createNewUserAndUnitFromInvitation({
  invitation,
  user
}: {
  invitation: InvitationByLinkId | InvitationInterface;
  user: Document<unknown, object, IUser> & IUser;
}) {
  const unit = await Unit.findOne({ _id: invitation.unit });
  const invitationDocument = await Invitation.findOne({ _id: invitation._id }); /* .session(session) */
  if (!invitationDocument || !unit) {
    throw new ErrorCustom('Invitation or Unit not found', 404);
  }
  unit.user = user._id;
  invitationDocument.status = invitationStatusEnum['completed-register'];

  // await session.commitTransaction();
  // session.endSession();

  // TODO: 1.SEND THANK YOU FOR REGISTERING WELCOME EMAIL
  // TODO: 1 connect user and space.(Create AccessPermission)
  await AccessPermission.create({
    user: user._id,
    space: invitation.space,
    role: RoleCache[invitation.userType]
  });
  await user.save();
  await unit.save();
  await invitationDocument.save();
  // authToken.active = false;
  // authToken.validatedAt = new Date();
  // await authToken.save();
}
