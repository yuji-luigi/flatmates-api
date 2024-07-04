import logger from '../../lib/logger';
import { CurrentSpace } from '../../lib/jwt/jwtTypings';
import Space from '../../models/Space';
import Unit from '../../models/Unit';
import { UserImportExcel } from '../../types/excel/UserImportExcel';
import Invitation from '../../models/Invitation';
import AuthToken from '../../models/AuthToken';
import { ObjectId } from 'mongodb';
import { oneDay } from '../globalVariables';

export async function handleImportFlatmates({
  excelData,
  currentSpace,
  createdBy
}: {
  excelData: UserImportExcel[];
  currentSpace: CurrentSpace;
  createdBy: ObjectId;
}) {
  try {
    const wings = excelData.map((flatmate) => flatmate.Scala);
    const uniqueWings = [...new Set(wings)];
    const result = [];
    for (const scala of uniqueWings) {
      // filter excel by scala
      const rowsByWing = excelData.filter((flatmate) => flatmate.Scala === scala);
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
        const rowsByWingAndFloor = rowsByWing.filter((flatmate) => flatmate.Piano === piano);
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

        const tailSpaces = rowsByWingAndFloor
          .filter((flatmate) => flatmate.Scala === scala && flatmate.Piano === piano)
          .map((flatmate) => flatmate['N.ro']);
        const _uniqueTailSpaces = [...new Set(tailSpaces)];
        const excelByFloor = rowsByWingAndFloor.filter((excel) => _uniqueTailSpaces.some((spaceName) => excel['N.ro'] === spaceName));
        for (const unitSpaceExcel of excelByFloor) {
          // search in DB to control if to save or not
          let unitSpaceToSave = await Space.findOne({
            name: unitSpaceExcel['N.ro'],
            parentId: floorObj._id
          });
          // case does not found. create new
          if (!unitSpaceToSave) {
            unitSpaceToSave = new Space({
              name: unitSpaceExcel['N.ro'],
              parentId: floorObj._id,
              isHead: false,
              type: 'unit',
              isTail: true
            });
            await unitSpaceToSave.save();
          }
          let updatingUnit = await Unit.findOne({
            name: unitSpaceExcel['N.ro'],
            space: currentSpace._id,
            wing: scalaSpace._id,
            floor: floorObj._id,
            unitSpace: unitSpaceToSave._id
          });
          if (!updatingUnit) {
            updatingUnit = await Unit.create({
              ownerName: unitSpaceExcel.Proprietario,
              tenantName: unitSpaceExcel.Inquilino,
              name: unitSpaceExcel['N.ro'],
              space: currentSpace._id,
              wing: scalaSpace._id,
              floor: floorObj._id,
              unitSpace: unitSpaceToSave._id,
              status: 'registration-pending'
            });
          }
          updatingUnit.ownerName = unitSpaceExcel.Proprietario;
          updatingUnit.tenantName = unitSpaceExcel.Inquilino;
          await updatingUnit.save();
          result.push(updatingUnit);

          const displayName = unitSpaceExcel.Inquilino || unitSpaceExcel.Proprietario;
          const foundInvitation = await Invitation.findOne({
            unit: updatingUnit._id,
            userType: 'inhabitant'
          });
          if (foundInvitation?.displayName === displayName) {
            continue;
          }
          if (foundInvitation && foundInvitation.displayName !== displayName) {
            foundInvitation.status = foundInvitation.status === 'pending' ? 'outdated' : foundInvitation.status;
            await foundInvitation.save();
          }
          const expiresAt = new Date(Date.now() + oneDay * 30);
          const newAuthToken = await AuthToken.create({
            type: 'invitation',
            expiresAt
          });
          await Invitation.create({
            userType: 'inhabitant',
            status: 'pending',
            type: 'qrcode',
            unit: updatingUnit._id,
            space: currentSpace._id,
            createdBy,
            displayName,
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
