import Mail from 'nodemailer/lib/mailer';
import logger from '../../config/logger';
import vars from '../../config/vars';
import AuthToken from '../../models/AuthToken';
import Space from '../../models/Space';
import User from '../../models/User';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { AuthTokenInterface } from '../../types/mongoose-types/model-types/auth-token-interface';
import { generateTokenUrl } from '../../utils/authTokenUtil';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { MongooseBaseModel } from '../../types/mongoose-types/model-types/base-types/base-model-interface';

export async function verifyPinFromRequest(req: RequestCustom): Promise<boolean> {
  const { linkId, idMongoose } = req.params;
  const { pin } = req.body;
  const data = await AuthToken.findOne<MongooseBaseModel>({
    linkId,
    _id: idMongoose,
    nonce: pin
  });
  const found = data ? true : false;

  return found;
}
