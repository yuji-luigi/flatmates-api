import { Document } from 'mongoose';
import { findAndUpdateInvitationStatus } from '../../../api/helpers/invitation-helpers';
import AuthToken from '../../../models/AuthToken';
import VerificationEmail from '../../../models/VerificationEmail';
import { AuthTokenInterface } from '../../../types/mongoose-types/model-types/auth-token-interface';
import { sendVerificationEmail } from '../../node-mailer/nodemailer';
import { IUser } from '../../../types/mongoose-types/model-types/user-interface';
import { InvitationInterface } from '../../../types/mongoose-types/model-types/invitation-interface';

export async function sendNewVerifyEmailUnitNewUser({ newUser, invitation }: { newUser: Document & IUser; invitation: InvitationInterface }) {
  // 1. create authTokens for user
  const authToken = (await AuthToken.create({
    type: 'email-verify'
  })) as Document & AuthTokenInterface & { type: 'email-verify' };

  const newVerificationEmail = await VerificationEmail.create({
    user: newUser,
    invitation: invitation._id,
    authToken: authToken._id,
    type: 'unit-register-email-verification'
  });

  // 2. create email options and send email with the options

  await sendVerificationEmail({
    ...newVerificationEmail.toObject(),
    authToken: authToken.toObject(),
    user: newUser.toObject()
  });

  await newUser.save();
  await findAndUpdateInvitationStatus(invitation, 'pending-email-verification');
}
