import Mail from 'nodemailer/lib/mailer';
import vars, { rootDir } from '../../utils/globalVariables';

import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { VerificationEmailInterfaceHydrated } from '../../types/mongoose-types/model-types/verification-email-interface';
import { AuthTokenType } from '../../types/mongoose-types/model-types/auth-token-interface';

const { gmailAddress, gmailAppPassword, displayMail, frontendUrl, testMail } = vars;
const EMAIL_TEMPLATE_PATH = `${rootDir}/src/email-template`;

// const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const auth = {
  user: vars.gmailAddress,
  pass: vars.gmailAppPassword
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth,
  port: 587
});
/**
 * @param {Mail.Options} mailOptions - accepts Mail.Options object already configured.
 */
export async function sendEmail(mailOptions: Mail.Options) {
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + result.response);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const subject: Record<AuthTokenType | 'default', string> = {
  'email-verify': 'Email Verification',
  'password-reset': 'Password Reset',
  invitation: 'Invitation',
  default: 'Email Verification'
};

export async function sendVerificationEmail(verificationEmail: VerificationEmailInterfaceHydrated) {
  const { user, authToken } = verificationEmail;
  try {
    const fullname = `${user.name} ${user.surname}`;
    const linkUrl = `${vars.frontendUrl}/auth/verify-email/${authToken.linkId}`;
    // get root path of the project
    const html = await ejs.renderFile(`${EMAIL_TEMPLATE_PATH}/auth-token-type/${authToken.type}.ejs`, { fullname, linkUrl, authToken });
    const subjectKey = authToken.type || 'default';

    const result = await transporter.sendMail({
      to: user.email,
      from: vars.displayMail,
      subject: subject[subjectKey],
      html
    });
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function _() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: vars.gmailAddress,
        pass: vars.gmailAppPassword
      }
    });
    const mailOptions = {
      from: vars.displayMail,
      to: vars.testMail,
      subject: 'Subject',
      text: 'Email content'
    };
    const result = await transporter.sendMail(
      mailOptions /* , function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        // do something useful
      }
    } */
    );
    console.log('Email sent: ' + result.response);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
