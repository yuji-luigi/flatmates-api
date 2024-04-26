import { MailOptions } from 'nodemailer/lib/json-transport';
import { RoleName } from '../../types/mongoose-types/model-types/role-interface';
import vars from '../../utils/globalVariables';
import Space from '../../models/Space';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';

export async function createInvitationEmail(args: {
  email: string;
  space: string;
  userType: RoleName;
  authToken: /* AuthTokenInterface */ any;
}): Promise<MailOptions> {
  const { email, space: spaceId } = args;
  const space = await Space.findById(spaceId);
  return {
    from: vars.displayMail,
    to: email,
    subject: `You are invited to ${space.name}`,
    html: getHtml({ ...args, space })
  };
}

function getHtml({ space, userType, authToken }: { email: string; space: ISpace; userType: RoleName; authToken: any }) {
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
        <h2 style="margin: 0; padding: 0; margin-bottom: 16px;">You are invited to ${space.name}</h2>
        <p style="margin: 0; margin-bottom: 8px;">Hello there,</p>
        <p>you are invited to condominium ${space.name} as a ${userType}.</p>
        <p style="margin: 0; margin-bottom: 8px;">Click the link below to accept the invitation.</p>

        <a
          href="${vars.frontendUrl}/auth/invitation/${authToken.linkId}"
          style="margin-top: 16px; background-color: #f08c00; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;"
          >Accept Invitation</a
        >
      </div>
    </html>
  `;
}

const html = String.raw;
