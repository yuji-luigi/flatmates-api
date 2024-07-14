import logger from '../../../lib/logger';
import { CurrentSpace } from '../../../lib/jwt/jwtTypings';
import Space from '../../../models/Space';
import Unit from '../../../models/Unit';
import { UserImportExcel } from '../../../types/excel/UserImportExcel';
import Invitation from '../../../models/Invitation';
import AuthToken from '../../../models/AuthToken';
import { ObjectId } from 'mongodb';
import { oneDay } from '../../globalVariables';
import { UnitInterface } from '../../../types/mongoose-types/model-types/unit-interface';

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
    const expiresAt = new Date(Date.now() + oneDay * 30 * 6);

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
          // find the unit by building, scala, floor, unitSpace(can be only unitSpaceId?)
          const foundUnit = await Unit.findOne({
            name: unitSpaceExcel['N.ro'],
            space: currentSpace._id,
            wing: scalaSpace._id,
            floor: floorObj._id,
            unitSpace: unitSpaceToSave._id
          });

          // 2. unit.user found + invitation not found => no operation in use found case.

          // 3. unit.user found => no operation

          // 4. unit.user not found + invitation found =>
          // 5. unit.user not found + invitation not found =>

          // no operation when the user is registered to unit.
          // NOTE: only system admin can remove user registered to unit(also super admin).
          // 3. unit.user found => no operation
          if (foundUnit?.user) {
            result.push(foundUnit);
            continue;
          }

          // 1. no unit found => create new unit. create new invitation.
          if (!foundUnit) {
            const newUnit = await Unit.create({
              ownerName: unitSpaceExcel.Proprietario,
              tenantName: unitSpaceExcel.Inquilino,
              name: unitSpaceExcel['N.ro'],
              space: currentSpace._id,
              wing: scalaSpace._id,
              floor: floorObj._id,
              unitSpace: unitSpaceToSave._id
            });
            result.push(newUnit);
            createNewInvitationConnectAuthTokenAndUnit({
              unit: newUnit,
              expiresAt,
              createdBy,
              currentSpace
            }).catch((error) => {
              logger.error(error.stack || error);
            });
            continue;
            // const newAuthToken = await AuthToken.create({
            //   type: 'invitation',
            //   expiresAt
            // });
            // await Invitation.createForUnit({
            //   unit: newUnit, // must be foundUnit or newUnit
            //   space: currentSpace._id,
            //   createdBy,
            //   authToken: newAuthToken._id
            // }).catch(async (error) => {
            //   logger.error(error.stack || error);
            //   await newAuthToken.deleteOne();
            // });
          }

          // NOTE: for readability set !foundUnit.user in condition.
          //NOTE: Always update the unit's ownerName, tenantName from excel.
          if (foundUnit && !foundUnit.user) {
            // overwrite the ownerName and tenantName from excel
            foundUnit.ownerName = unitSpaceExcel.Proprietario;
            foundUnit.tenantName = unitSpaceExcel.Inquilino;
            await foundUnit.save();
            result.push(foundUnit);
            //NOTE: When this function is called the invitation statuses are updated to expired based on the authToken expiresAt.
            const foundPendingInvitation = await Invitation.findOne({
              unit: foundUnit._id,
              userType: 'inhabitant',
              status: { $in: ['pending', 'pending-email-verification'] }
            });
            // case not completed invitation is found.
            // the name is the same then no operation.
            // otherwise deletedAt and create new invitation.
            // 4. unit.user not found + invitation found
            // prev invitation set to expired + deletedAt to now.
            // NOTE: check for invitation change
            if (foundPendingInvitation) {
              // case the invitation is now verify email step then no operation.
              if (foundPendingInvitation.status === 'pending-email-verification') {
                continue;
              }
              // NOTE: HERE ALL THE INVITATION THAT WAS STATUS PENDING IS NOW EXPIRED IN PREV FUNCTION CALL. NOT NEED TO CHECK FOR EXPIRED. JUST CREATE NEW.
              // BUT CHECK AND DELETE
              foundPendingInvitation.deletedAt = new Date();
              await AuthToken.findOneAndUpdate({ _id: foundPendingInvitation.authToken }, { active: false }, { runValidators: true, new: true });
              await foundPendingInvitation.save();
              logger.error('This closure should be never. If it is then check the code.');
            }
            // case invitation not found then create new invitation. also
            await createNewInvitationConnectAuthTokenAndUnit({
              unit: foundUnit,
              expiresAt,
              createdBy,
              currentSpace
            }).catch((error) => {
              logger.error(error.stack || error);
            });
            continue;
          }
        }
      }
    }
    return result;
  } catch (error) {
    logger.error(error.stack || error);
    throw new Error('Error creating spaces from excel data');
  }
}

async function createNewInvitationConnectAuthTokenAndUnit({
  unit,
  expiresAt,
  createdBy,
  currentSpace
}: {
  unit: UnitInterface;
  expiresAt: Date;
  createdBy: ObjectId;
  currentSpace: CurrentSpace;
}) {
  const newAuthToken = await AuthToken.create({
    type: 'invitation',
    expiresAt
  });
  await Invitation.createForUnit({
    unit, // must be updatingUnit or newUnit
    space: currentSpace._id as ObjectId,
    createdBy,
    authToken: newAuthToken._id
  });
}
