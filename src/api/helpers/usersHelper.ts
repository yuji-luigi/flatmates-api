import Mail from 'nodemailer/lib/mailer';
import logger from '../../lib/logger';
import vars from '../../utils/globalVariables';
import AuthToken from '../../models/AuthToken';
import User from '../../models/User';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { AuthTokenInterface } from 'mongoose-types/model-types/AuthTokenInterface';
import { generateTokenUrl } from '../../lib/jwt/jwtUtils';
import { checkDuplicateEmail } from './mongoose.helper';
import { ObjectId } from 'bson';

export type userExcelData = {
  name: string;
  surname: string;
  email: string;
  building: string;
  floor: number;
  room: number;
};

/**  @description create clone and delete email field if duplicate found */
export async function deleteDuplicateEmailField(excelData: userExcelData) {
  const clonedJson = structuredClone(excelData);
  const duplicateEmailFound = await checkDuplicateEmail({ model: User, email: clonedJson.email });
  if (duplicateEmailFound) {
    delete clonedJson.email;
  }
  return clonedJson;
}

export async function handleConstructUpdateUser({
  excelData,
  space,
  organization
}: {
  excelData: userExcelData;
  space: ObjectId;
  organization: ObjectId;
}) {
  try {
    const duplicateEmailFound = await checkDuplicateEmail({ model: User, email: excelData.email });
    if (duplicateEmailFound) {
      delete excelData.email;
    }
    let user = await User.findOne({
      name: excelData.name,
      surname: excelData.surname,
      spaces: { $in: [space] },
      organizations: { $in: [organization] }
    });
    // case already imported once. update the user
    if (user) {
      user.set({
        name: excelData.name,
        surname: excelData.surname,
        email: excelData.email,
        spaces: [space],
        role: 'user'
      });
    }
    // case new user. create new one + new authToken
    if (!user) {
      user = new User({
        name: excelData.name,
        surname: excelData.surname,
        email: excelData.email,
        spaces: [space],
        role: 'user',
        organizations: [organization]
      });
    }
    return user;
  } catch (error) {
    logger.error(error.message || error, 'error in registerUserCondominium');
    throw new Error(error.message || error);
  }
}

export async function createMailOptionsForUserToken({ userId }: { userId: string }): Promise<Mail.Options> {
  try {
    const user = await User.findById(userId);
    if (!user.email) {
      throw new Error('User does not have email');
    }
    const authToken = await AuthToken.findOne({ 'docHolder.ref': User.collection.collectionName, 'docHolder.instanceId': user._id });
    const html = createTokenMailBodyByUser(user as IUser, authToken);
    const options: Mail.Options = {
      from: vars.displayMail,
      to: user.email,
      // to: user.email,
      subject: 'Flatmates: Access to platform for register.',
      html
    };

    return options;
  } catch (error) {
    logger.error(error.message || error);
    throw new Error(`Error creating options for maintenance: ${error.message || error}`);
  }
}

function createTokenMailBodyByUser(user: IUser, authToken: AuthTokenInterface) {
  const url = generateTokenUrl.userRegister(authToken);
  const html = `
  <p>${user.name} ${user.surname}</p>
  <p>nonce: ${authToken.nonce}</p>
  <p>url: ${url}</p>
  `;
  return html;
}

export function createUserExcelPromises({ excelData, space, organization }: { excelData: userExcelData[]; space: ObjectId; organization: ObjectId }) {
  const promises = excelData.map((current) => async () => {
    current = await deleteDuplicateEmailField(current); // Await some async operation
    const newUser = await handleConstructUpdateUser({ excelData: current, space, organization }); // Await another async operation

    // await handleCreateAuthTokenForUser(newUser); // Another one
    await newUser.save(); // And another one
  });
  return promises;
}
