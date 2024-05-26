import logger from '../../lib/logger';
import { CurrentSpace } from '../../lib/jwt/jwtTypings';
import Space from '../../models/Space';
import Unit from '../../models/Unit';
import { UserImportExcel } from '../../types/excel/UserImportExcel';
import Invitation from '../../models/Invitation';
import AuthToken from '../../models/AuthToken';

export async function handleImportFlatmates({ excelData, currentSpace }: { excelData: UserImportExcel[]; currentSpace: CurrentSpace }) {
  try {
    const blocks = excelData.map((flatmate) => flatmate.Scala);
    const uniqueBlocks = [...new Set(blocks)];
    const result = [];
    for (const scala of uniqueBlocks) {
      /** "scala" in excel */
      let scalaSpace = await Space.findOne({ name: scala, parentId: currentSpace._id });
      if (!scalaSpace) {
        scalaSpace = new Space({
          name: scala,
          parentId: currentSpace._id,
          type: 'block',
          isHead: false
        });
        await scalaSpace.save();
      }
      const floors = excelData.filter((flatmate) => flatmate.Scala === scala).map((flatmate) => flatmate.Piano);
      const uniqueFloors = [...new Set(floors)];
      for (const piano of uniqueFloors) {
        let floorObj = await Space.findOne({ name: piano.toString(), parentId: scalaSpace._id });
        if (!floorObj) {
          floorObj = new Space({
            name: piano.toString(),
            parentId: scalaSpace._id,
            isHead: false,
            type: 'floor'
          });
          await floorObj.save();
        }

        const tailSpaces = excelData.filter((flatmate) => flatmate.Scala === scala && flatmate.Piano === piano).map((flatmate) => flatmate['N.ro']);
        const _uniqueTailSpaces = [...new Set(tailSpaces)];
        const uniqueTailSpaces = excelData.filter((excel) => _uniqueTailSpaces.some((spaceName) => excel['N.ro'] === spaceName));
        for (const unitSpace of uniqueTailSpaces) {
          // search in DB to control if to save or not
          let unitSpaceToSave = await Space.findOne({ name: unitSpace['N.ro'], parentId: floorObj._id });
          // case does not found. create new
          if (!unitSpaceToSave) {
            unitSpaceToSave = new Space({
              name: unitSpace['N.ro'],
              parentId: floorObj._id,
              isHead: false,
              type: 'unit',
              isTail: true
            });
            await unitSpaceToSave.save();
          }
          let updatingUnit = await Unit.findOne({ name: unitSpace['N.ro'], unitSpace: unitSpaceToSave._id });
          if (!updatingUnit) {
            updatingUnit = await Unit.create({
              ownerName: unitSpace.Proprietario,
              mateName: unitSpace.Inquilino,
              name: unitSpace['N.ro'],
              unitSpace: unitSpaceToSave._id,
              space: currentSpace._id,
              status: 'registration-pending'
            });
          }
          updatingUnit.ownerName = unitSpace.Proprietario;
          updatingUnit.mateName = unitSpace.Inquilino;
          await updatingUnit.save();
          result.push(updatingUnit);

          const newAuthToken = await AuthToken.create({});

          await Invitation.create({
            userType: 'inhabitant',
            status: 'pending',
            unit: updatingUnit._id,
            space: currentSpace._id,
            authToken: newAuthToken._id
          }).catch(async (error) => {
            logger.error(error.stack || error);
            await newAuthToken.deleteOne();
          });
        }
      }
    }
    return result;
  } catch (error) {
    logger.error(error.stack || error);
    throw new Error('Error creating spaces from excel data');
  }
}
