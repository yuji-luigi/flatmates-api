import Mail from 'nodemailer/lib/mailer';
import logger from '../../lib/logger';
import vars from '../../utils/globalVariables';
import AuthToken from '../../models/AuthToken';
import User from '../../models/User';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';
import { AuthTokenInterface } from 'mongoose-types/model-types/auth-token-interface';
import { generateTokenUrl } from '../../lib/jwt/jwtUtils';
import { ErrorCustom } from '../../lib/ErrorCustom';

// /**  @description create clone and delete email field if duplicate found */
// export async function deleteDuplicateEmailField(excelData: UserImportExcel) {
//   const clonedJson = structuredClone(excelData);
//   const duplicateEmailFound = await checkDuplicateEmail({ model: User, email: clonedJson.email });
//   if (duplicateEmailFound) {
//     delete clonedJson.email;
//   }
//   return clonedJson;
// }

// export async function handleConstructUpdateUser({ excelData, space }: { excelData: UserImportExcel; space: ObjectId }) {
//   try {
//     const duplicateEmailFound = await checkDuplicateEmail({ model: User, email: excelData.email });
//     if (duplicateEmailFound) {
//       delete excelData.email;
//     }
//     const _aggUser = await User.aggregate([
//       {
//         $match: {
//           name: excelData.name,
//           surname: excelData.surname
//         }
//       },
//       {
//         $lookup: {
//           from: 'accessPermissions',
//           localField: 'user',
//           foreignField: '_id',
//           as: 'accessPermission',
//           pipeline: [
//             {
//               $match: {
//                 space: space
//               }
//             }
//           ]
//         }
//       },
//       {
//         $unwind: {
//           path: '$accessPermission',
//           preserveNullAndEmptyArrays: true
//         }
//       }
//     ]);
//     let user = await User.findOne({
//       name: excelData.name,
//       surname: excelData.surname
//     });
//     // case already imported once. update the user
//     if (user) {
//       user.set({
//         name: excelData.name,
//         surname: excelData.surname,
//         email: excelData.email
//       });
//     }
//     // case new user. create new one + new authToken
//     if (!user) {
//       user = new User({
//         name: excelData.name,
//         surname: excelData.surname,
//         email: excelData.email,
//         role: 'user'
//       });
//     }
//     return user;
//   } catch (error) {
//     logger.error(error.message || error, 'error in registerUserCondominium');
//     throw new Error(error.message || error);
//   }
// }

export async function createMailOptionsForUserToken({ userId }: { userId: string }): Promise<Mail.Options> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.email) {
      throw new Error('User does not have email');
    }
    const authToken = await AuthToken.findOne({ 'docHolder.ref': User.collection.collectionName, 'docHolder.instanceId': user._id });
    if (!authToken) {
      throw new ErrorCustom('Auth token not found', 404);
    }
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
