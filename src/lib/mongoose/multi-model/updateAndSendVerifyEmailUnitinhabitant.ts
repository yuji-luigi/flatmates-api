import { Document } from 'mongoose';
import AuthToken from '../../../models/AuthToken';
import VerificationEmail from '../../../models/VerificationEmail';
import { sendVerificationEmail } from '../../node-mailer/nodemailer';
import { IUser } from '../../../types/mongoose-types/model-types/user-interface';
import { InvitationInterface } from '../../../types/mongoose-types/model-types/invitation-interface';
import httpStatus from 'http-status';
import User from '../../../models/User';
import { ErrorCustom } from '../../ErrorCustom';

export async function sendNewVerifyEmailUnitNewUser({ newUser, invitation }: { newUser: Document & IUser; invitation: InvitationInterface }) {
  const verificationEmail = await VerificationEmail.findOne({
    invitation: invitation._id
  });
  if (!verificationEmail) {
    throw new ErrorCustom('Verification email not found', httpStatus.NOT_FOUND);
  }

  const upUser = await User.findById(verificationEmail.user);
  if (!upUser) {
    throw new ErrorCustom('User not found', httpStatus.NOT_FOUND);
  }
  await AuthToken.deleteOne({ _id: verificationEmail.authToken });
  const newAuthToken = await AuthToken.create({
    type: 'email-verify'
  });
  const { email, password, name, surname, locale } = newUser;
  verificationEmail.authToken = newAuthToken._id;
  upUser.email = email;
  upUser.password = password;
  upUser.name = name;
  upUser.surname = surname;
  upUser.locale = locale;
  await upUser.save();
  await verificationEmail.save();
  await sendVerificationEmail({
    ...verificationEmail.toObject(),
    authToken: newAuthToken.toObject(),
    user: upUser.toObject()
  });
}
