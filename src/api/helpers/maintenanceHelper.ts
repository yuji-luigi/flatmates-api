import Mail from 'nodemailer/lib/mailer';
import logger from '../../lib/logger';
import vars from '../../utils/globalVariables';
import Space from '../../models/Space';
import { IMaintenance } from '../../types/mongoose-types/model-types/maintenance-interface';
import { MaintainerInterface } from '../../types/mongoose-types/model-types/maintainer-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { AuthTokenInterface } from 'mongoose-types/model-types/auth-token-interface';
import { Maintainer } from '../../models/util-models/user-by-user-type/Maintainer';
import { PropertyManager } from '../../models/util-models/user-by-user-type/PropertyManager';
import { ReqUser } from '../../lib/jwt/jwtTypings';

export async function createOptionsForMaintenance({
  maintenance,
  authToken,
  user
}: {
  maintenance: IMaintenance;
  authToken: AuthTokenInterface;
  user: ReqUser;
}): Promise<Mail.Options | false> {
  try {
    const admins = await PropertyManager.find({
      matchStage: {
        accessPermissions: { $elemMatch: { 'space._id': maintenance.space._id } }
      }
    });
    if (!admins.length) {
      return false;
    }
    const space = await Space.findById(maintenance.space);
    const html = createBodyForMaintenance({ maintenance, user, space, authToken });
    const options: Mail.Options = {
      from: vars.displayMail,
      to: 'u.ji.jp777@gmail.com',
      // to: admins.map((admin) => admin.email),
      subject: `Maintenance assigned. ${space.name}: ${maintenance.title}`,
      html
    };

    return options;
  } catch (error) {
    logger.error(error.message || error);
    throw new Error(`Error creating options for maintenance: ${error.message || error}`);
  }
}

function createBodyForMaintenance({
  maintenance,
  user,
  space,
  authToken
}: {
  maintenance: IMaintenance;
  user: ReqUser;
  space: ISpace;
  authToken: AuthTokenInterface;
}) {
  const imagesHtml = maintenance.images.map((image) => `<img src="${image.url}" alt="${image.fileName}" />`);
  const { name, surname } = user;
  const userName = `${name} ${surname}`;
  const html = `
  <!DOCTYPE html PUBLIC >
<html>
<head>
<style>
  * {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', sans-serif;
  }
  
  h1 {
      padding-block: 16px;
      width: 100%;
      text-align: center;
  }
  nav{
   background: gray;   |
  }
  
  main {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
  }
  section {
      padding: 0px;
      border: 4px solid gray;
      border-radius: 1rem;
  }
  .contents {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      
  }
  
  a{
      color: gray;
  }
  </style>
  </head>
  <body>
  <main>
  <section>
  <nav>
     <h1> Flatmates</h1>
  </nav>
  <div class="contents">
      <h3 class="greeting">Buongiorno</h3>
  <h4>${userName} ha assegnato manutenzione in codominio di ${space.name}</h4
  >
      
  <h4>${maintenance.description}</h4>
  <h1>Inserisci codice alla link: ${authToken.nonce}</h1>
  <h4>
  Clicca qui per controllare:
  <a href="${generateUploadUrl(authToken)}">
  https://flatmates.yuji-luigi.com
  </a>
  </h4>
  ${imagesHtml && imagesHtml.length > 0 ? imagesHtml.join('') : ''}
  <h3>${space.name}</h3>
  <h3>indirizzo: ${space.address}</h3>
      
  </div>
  </section>
  
  </main>
  </body>
  </html>

`;
  return html;
}

export async function createOptionsToNotifyMaintainer({
  maintenance,
  authToken
}: {
  maintenance: IMaintenance;
  authToken: AuthTokenInterface;
}): Promise<Mail.Options | false> {
  try {
    const maintainer = await Maintainer.findById(maintenance.maintainer);
    if (!maintainer) {
      return false;
    }
    const space = await Space.findById(maintenance.space);
    const html = createBodyToNotifyMaintenainer({ maintenance, maintainer, space, authToken });
    const options: Mail.Options = {
      from: vars.displayMail,
      to: maintainer.email,
      subject: `Maintenance assigned. ${space.name}: ${maintenance.title}`,
      html
    };

    return options;
  } catch (error) {
    logger.error(error.message || error);
    throw new Error(`Error creating options for maintenance: ${error.message || error}`);
  }
}

function createBodyToNotifyMaintenainer({
  maintenance,
  maintainer,
  space,
  authToken
}: {
  maintenance: IMaintenance;
  maintainer: MaintainerInterface;
  space: ISpace;
  authToken: AuthTokenInterface;
}) {
  const imagesHtml = maintenance.images.map((image) => `<img src="${image.url}" alt="${image.fileName}" />`);

  const html = `
<h3>Buongiorno, ${maintainer.name}</h3>
<h4> Ti ha assegnato manutenzione in codominio di ${space.name} </h4>
</br>
<h3> --- descrizioni ---</h3>
<h4>${maintenance.description}</h4>
<h1>Inserisci codice alla link: ${authToken.nonce}</h1>
<h4>
<a href="${generateUploadUrl(authToken)}">
Clicca qui per inserire fattura/ricevuta
</a>
</h4>
${imagesHtml && imagesHtml.length > 0 ? imagesHtml.join('') : ''}
<h3>${space.name}</h3>
<h3>indirizzo: ${space.address}</h3>
`;
  return html;
}

function generateUploadUrl(authToken: AuthTokenInterface) {
  const url = `${vars.frontendUrl}/auth-tokens/maintainer-upload-files/${authToken.linkId}/${authToken._id.toString()}`;
  return url;
}
