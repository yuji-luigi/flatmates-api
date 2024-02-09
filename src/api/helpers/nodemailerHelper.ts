import Mail from 'nodemailer/lib/mailer';
import vars from '../../utils/globalVariables';

import nodemailer from 'nodemailer';

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
