import { invitationStatus } from '../../../types/mongoose-types/model-types/invitation-interface';
import { InvitationByLinkId } from '../../../api/helpers/authTokenHelper';
import AccessPermission from '../../../models/AccessPermission';
import Invitation from '../../../models/Invitation';
import Unit from '../../../models/Unit';
import User from '../../../models/User';
import { InvitationInterface } from '../../../types/mongoose-types/model-types/invitation-interface';
import { UserBase } from '../../../types/mongoose-types/model-types/user-interface';
import { RoleCache } from '../mongoose-cache/role-cache';
import { logger } from '../../logger';

export async function connectInhabitantFromInvitation({
  invitation,
  user,
  // authToken,
  invitationStatus = 'completed-register'
}: {
  invitation: InvitationByLinkId | InvitationInterface;
  user: UserBase;
  // authToken: AuthTokenDocument;
  invitationStatus: invitationStatus;
}) {
  await User.updateOne({ _id: user._id }, { active: true }, { new: true, runValidators: true }); /* .session(session) */
  await Unit.updateOne({ _id: invitation.unit }, { user: user._id }, { new: true, runValidators: true });
  await Invitation.updateOne(
    { _id: invitation._id },
    { status: invitationStatus, acceptedAt: new Date() },
    { new: true, runValidators: true }
  ); /* .session(session) */

  // await session.commitTransaction();
  // session.endSession();

  // TODO: 1.SEND THANK YOU FOR REGISTERING WELCOME EMAIL
  // TODO: 1 connect user and space.(Create AccessPermission)
  await AccessPermission.create({
    user: user._id,
    space: invitation.space,
    role: RoleCache[invitation.userType]
  }).catch((err) => {
    logger.error(err);
  });

  // authToken.active = false;
  // authToken.validatedAt = new Date();
  // await authToken.save();
}
