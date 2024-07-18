import logger from '../../lib/logger';
import AuthToken from '../../models/AuthToken';
import Space from '../../models/Space';
import User from '../../models/User';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { UserImportExcel } from '../../types/excel/UserImportExcel';

// export async function handleConstructUpdateUser({
//   excelData,
//   mainSpace,
//   organization
// }: {
//   excelData: ;
//   mainSpace: ObjectId;
//   organization: ObjectId;
// }) {
//   try {
//     const duplicateEmailFound = await checkDuplicateEmail({ model: User, email: excelData.email });
//     if (duplicateEmailFound) {
//       delete excelData.email;
//     }
//     let user = await User.findOne({
//       name: excelData.name,
//       surname: excelData.surname,
//       rootSpaces: { $in: [mainSpace] },
//       organizations: { $in: [organization] }
//     });
//     // case already imported once. update the user
//     if (user) {
//       user.set({
//         name: excelData.name,
//         surname: excelData.surname,
//         email: excelData.email,
//         rootSpaces: [mainSpace],
//         role: 'user'
//       });
//     }
//     // case new user. create new one + new authToken
//     if (!user) {
//       user = new User({
//         name: excelData.name,
//         surname: excelData.surname,
//         email: excelData.email,
//         rootSpaces: [mainSpace],
//         role: 'user',
//         organizations: [organization]
//       });
//     }
//     return user;
//   } catch (error) {
//     logger.error(error.message || error, 'error in registerUserCondominium');
//     throw new Error(error.message || error);
//   }
// }

// not using now
export async function handleCreateSpaceByUserUnit({ excelData, mainSpace }: { excelData: UserImportExcel[]; mainSpace: ISpace }) {
  try {
    // NOTE: building should be forced to mainSpace.name
    //TODO: CREATE SPACES
    //TODO: CREATE UNITS
    // TODO: CREATE INVITATION ASSOCIATES TO UNITS
    // TODO: NOT HERE BUT ACCEPT INVITATION FOR INHABITANTS. 1. LINKID AND UNIT SEND THEM VIA LETTER SINCE AMMINISTRATORE DOES SHOULD NOT HAVE EMAIL OF INHABITANTS
    const buildings = excelData.map((row) => row['Palazz.']);
    const uniqueBuildings = [...new Set(buildings)];
    for (const building of uniqueBuildings) {
      let buildingObj = await Space.findOne({ name: building, parentId: mainSpace._id });
      if (!buildingObj) {
        buildingObj = new Space({
          name: building,
          parentId: mainSpace._id,
          // organization: mainSpace.organization,
          isHead: false,
          type: 'building'
        });
        await buildingObj.save();
      }
      const floors = excelData.filter((user) => user['Palazz.'] === building).map((user) => user.Scala);
      const uniqueFloors = [...new Set(floors)];
      for (const floor of uniqueFloors) {
        let floorObj = await Space.findOne({ name: floor.toString(), parentId: buildingObj._id });
        if (!floorObj) {
          floorObj = new Space({
            name: floor.toString(),
            parentId: buildingObj._id,
            // organization: mainSpace.organiztion,
            isHead: false,
            type: 'floor'
          });
          await floorObj.save();
        }

        const tailSpaces = excelData
          .filter((document) => document['Palazz.'] === building && document.Scala === floor)
          .map((document) => document['N.ro']);
        const uniqueTailSpaces = [...new Set(tailSpaces)];

        for (const tailSpace of uniqueTailSpaces) {
          // search in DB to control if to save or not
          let tailSpaceToSave = await Space.findOne({ name: tailSpace.toString(), parentId: floorObj._id });
          // case does not found. create new
          if (!tailSpaceToSave) {
            tailSpaceToSave = new Space({
              name: tailSpace.toString(),
              parentId: floorObj._id,
              // organization: mainSpace.organization,
              isHead: false,
              isTail: true,
              spaceType: 'unit'
            });
            await tailSpaceToSave.save();
          }
          const _currentDocument = excelData.find(
            (document) => document['Palazz.'] === building && document.Scala === floor && document['N.ro'] === tailSpace
          );
          const authToken = await AuthToken.create({});
          // const {} = currentDocument;
          //TODO: CREATE INVITATION

          const foundUser = await User.findOne({ tailSpace: tailSpaceToSave._id });

          if (foundUser) continue;

          const _newUser = await User.create({
            // name,
            // surname,
            // email,
            rootSpaces: [mainSpace],
            active: false,
            // organization: mainSpace.organization,
            authToken,
            role: 'user'
          });
          // tailSpaceToSave.user = newUser as IUser;
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
