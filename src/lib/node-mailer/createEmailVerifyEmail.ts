import { MailOptions } from 'nodemailer/lib/json-transport';
import vars from '../../utils/globalVariables';
import { translationResources } from './translations';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { Document } from 'mongoose';

export function createEmailVerifyEmailOptions(args: {
  email: string;
  authToken: AuthTokenInterface & Document & { type: 'email-verify' };
}): MailOptions {
  const { email } = args;
  return {
    from: vars.displayMail,
    to: email,
    subject: `FlatMate: Email Verification`,
    html: getHtml({ ...args })
  };
}

function getHtml({
  locale = 'it',
  authToken
}: {
  email: string;
  authToken: AuthTokenInterface & Document & { type: 'email-verify' };
  locale?: 'it' | 'en';
}) {
  const t = translationResources[locale];

  return html`
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <div
        style="font-family: 'Roboto', sans-serif; border: 1px solid lightgray; margin: 32px; padding: 40px; border-radius: 8px; font-size: 120%; color: black;"
      >
        <img src="https://source.unsplash.com/random" style="width: 100%; height: 100px; object-fit: cover; margin-bottom: 24px;" />
        <h2 style="margin: 0; padding: 0; margin-bottom: 16px;">${t('Email Verification')}</h2>
        <p style="margin: 0; margin-bottom: 8px;">${t('Hello there,')}</p>
        <p>${t('Thank you for choosing FlatMate! Almost there to complete registration')}</p>
        <p style="margin: 0; margin-bottom: 8px;">${t('Click below and insert the code to verify your email.')}</p>
        <h3>Code: ${authToken.nonce}</h3>
        <a
          href="${vars.frontendUrl}/auth/verify-email/${authToken.linkId}"
          style="margin-top: 16px; background-color: #f08c00; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;"
          >${t('Click here')}</a
        >
      </div>
    </html>
  `;
}

const html = String.raw;
