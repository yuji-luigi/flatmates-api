import { MailOptions } from 'nodemailer/lib/json-transport';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
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
  const { email, space: spaceId, userType, authToken } = args;
  const space = await Space.findById(spaceId);
  return {
    from: vars.displayMail,
    to: email,
    subject: `You are invited to ${space.name}`,
    html: getHtml({ ...args, space })
  };
}

function getHtml({ email, space, userType, authToken }: { email: string; space: ISpace; userType: RoleName; authToken: any }) {
  return html`
    <section>
      <h1>You are invited to ${space.name}</h1>
      <p>You are invited to ${space.name} as a ${userType}. Click the link below to accept the invitation.</p>
      <a href="${vars.frontendUrl}/auth/invitation/${authToken.linkId}">Accept Invitation</a>å
    </section>
  `;
}

const html = String.raw;
