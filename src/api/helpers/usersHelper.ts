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
import { checkDuplicateEmail } from './mongoose.helper';

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

export async function handleConstructUpdateUser({ excelData, mainSpace }: { excelData: userExcelData; mainSpace: ISpace }) {
  try {
    const duplicateEmailFound = await checkDuplicateEmail({ model: User, email: excelData.email });
    if (duplicateEmailFound) {
      delete excelData.email;
    }
    let user = new User({
      ...excelData,
      rootSpaces: [mainSpace]
    });
    const foundUser = await User.findOne({ name: excelData.name, surname: excelData.surname });
    if (foundUser) {
      user = foundUser;
      foundUser.set({
        ...excelData,
        rootSpaces: [mainSpace]
      });
    }
    return user;
  } catch (error) {
    logger.error(error.message || error, 'error in registerUserCondominium');
    throw new Error(error.message || error);
  }
}

export async function handleCreateSpaceByUserUnit({ excelData, mainSpace }: { excelData: userExcelData[]; mainSpace: ISpace }) {
  try {
    const buildings = excelData.map((user) => user.building);
    const uniqueBuildings = [...new Set(buildings)];
    for (const building of uniqueBuildings) {
      let buildingObj = await Space.findOne({ name: building, parentId: mainSpace._id });
      if (!buildingObj) {
        buildingObj = new Space({
          name: building,
          parentId: mainSpace._id,
          organization: mainSpace.organization,
          isHead: false,
          type: 'building'
        });
        await buildingObj.save();
      }
      const floors = excelData.filter((user) => user.building === building).map((user) => user.floor);
      const uniqueFloors = [...new Set(floors)];
      for (const floor of uniqueFloors) {
        let floorObj = await Space.findOne({ name: floor.toString(), parentId: buildingObj._id });
        if (!floorObj) {
          floorObj = new Space({
            name: floor.toString(),
            parentId: buildingObj._id,
            organization: mainSpace.organization,
            isHead: false,
            type: 'floor'
          });
          await floorObj.save();
        }

        const tailSpaces = excelData
          .filter((document) => document.building === building && document.floor === floor)
          .map((document) => document.room);
        const uniqueTailSpaces = [...new Set(tailSpaces)];

        for (const tailSpace of uniqueTailSpaces) {
          // search in DB to control if to save or not
          let tailSpaceToSave = await Space.findOne({ name: tailSpace.toString(), parentId: floorObj._id });
          // case does not found. create new
          if (!tailSpaceToSave) {
            tailSpaceToSave = new Space({
              name: tailSpace.toString(),
              parentId: floorObj._id,
              organization: mainSpace.organization,
              isHead: false,
              isTail: true,
              spaceType: 'unit'
            });
            await tailSpaceToSave.save();
          }
          const currentDocument = excelData.find(
            (document) => document.building === building && document.floor === floor && document.room === tailSpace
          );
          const authToken = await AuthToken.create({});
          const { name, surname, email } = currentDocument;
          const foundUser = await User.findOne({ name, surname, tailSpace: tailSpaceToSave._id });
          if (foundUser) continue;

          const newUser = await User.create({
            name,
            surname,
            email,
            rootSpaces: [mainSpace],
            active: false,
            organization: mainSpace.organization,
            authToken,
            role: 'user'
          });
          tailSpaceToSave.user = newUser as IUser;
          await tailSpaceToSave.save();
        }
      }
    }
    return;
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('Error creating spaces from excel data');
  }
}

export async function createMailOptionsForUserToken({ userId }: { userId: string }): Promise<Mail.Options> {
  try {
    const user = await User.findById(userId);
    const authToken = await AuthToken.findById(user.authToken);
    const html = createTokenMailBodyByUser(user as IUser, authToken);
    const options: Mail.Options = {
      from: vars.displayMail,
      to: user.email,
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
