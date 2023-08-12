import logger from '../../config/logger';
import AuthToken from '../../models/AuthToken';
import Space from '../../models/Space';
import User from '../../models/User';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';

export type userExcelData = {
  name: string;
  surname: string;
  email: string;
  building: string;
  floor: number;
  room: number;
};

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
            authToken
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
