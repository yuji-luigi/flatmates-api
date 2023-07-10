import Mail from 'nodemailer/lib/mailer';
import logger from '../../config/logger';
import vars from '../../config/vars';
import Space from '../../models/Space';
import { IMaintenance } from '../../types/model/maintenance-type';
import Maintainer from '../../models/Maintainer';

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
  const imagesHtml = maintenance.images.map((image) => `<img src="${image.url}" alt="${image.name}" />`);

  const html = `
<h3>Buongiorno, ${maintainer.name}. Ti ha assegnato manutenzione in codominio di ${mainSpace.name}</h3>
<h3>indirizzo: ${mainSpace.address}</h3>
  </br>
  <p>description: ${maintenance.description}</p>
  ${imagesHtml && imagesHtml.length > 0 ? imagesHtml.join('') : ''}`;
  return html;
}
