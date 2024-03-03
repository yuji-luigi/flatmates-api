import Mail from 'nodemailer/lib/mailer';
import logger from '../../lib/logger';
import vars from '../../utils/globalVariables';
import Space from '../../models/Space';
import { IMaintenance } from '../../types/mongoose-types/model-types/maintenance-interface';
import { MaintainerInterface } from '../../types/mongoose-types/model-types/maintainer-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { AuthTokenInterface } from 'mongoose-types/model-types/auth-token-interface';
import { Maintainer } from '../controllers/MaintainerController';

export async function createOptionsForMaintenance({
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
    const html = createBodyForMaintenance({ maintenance, maintainer, space, authToken });
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

function createBodyForMaintenance({
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
