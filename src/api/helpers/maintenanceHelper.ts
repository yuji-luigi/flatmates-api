import Mail from 'nodemailer/lib/mailer';
import logger from '../../config/logger';
import vars from '../../config/vars';
import Space from '../../models/Space';
import { IMaintenance } from '../../types/mongoose-types/model-types/maintenance-interface';
import Maintainer from '../../models/Maintainer';
import { MaintainerInterface } from '../../types/mongoose-types/model-types/maintainer-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';

export async function createOptionsForMaintenance({ maintenance }: { maintenance: IMaintenance }): Promise<Mail.Options> {
  try {
    const maintainer = await Maintainer.findById(maintenance.maintainer);
    const mainSpace = await Space.findById(maintenance.mainSpace);
    const html = createBodyForMaintenance({ maintenance, maintainer, mainSpace });
    const options: Mail.Options = {
      from: vars.displayMail,
      to: maintainer.email,
      subject: `Maintenance assigned. ${mainSpace.name}: ${maintenance.title}`,
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
  mainSpace
}: {
  maintenance: IMaintenance;
  maintainer: MaintainerInterface;
  mainSpace: ISpace;
}) {
  const imagesHtml = maintenance.images.map((image) => `<img src="${image.url}" alt="${image.fileName}" />`);

  const html = `
<h3>Buongiorno, ${maintainer.name}</h3>
<h4> Ti ha assegnato manutenzione in codominio di ${mainSpace.name} </h4>
</br>
<h3> --- descrizioni ---</h3>
<h4>${maintenance.description}</h4>
<h1>Inserisci codice alla link: ${maintenance.nonce}</h1>
<h4>
<a href="${generateUploadUrl(maintenance)}">
Clicca qui per inserire fattura/ricevuta
</a>
</h4>
${imagesHtml && imagesHtml.length > 0 ? imagesHtml.join('') : ''}
<h3>${mainSpace.name}</h3>
<h3>indirizzo: ${mainSpace.address}</h3>
`;
  return html;
}

function generateUploadUrl(maintenance: IMaintenance) {
  const url = `${vars.frontendUrl}/maintainer-upload-files/${maintenance.linkId}/${maintenance._id.toString()}`;
  return url;
}
