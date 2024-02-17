import { Request, Response } from 'express';
import httpStatus from 'http-status';
// import { UserModel } from 'model/user';
import vars from '../../utils/globalVariables';
import { _MSG } from '../../utils/messages';
import AccessController from '../../models/AccessController';
import Role from '../../models/Role';
// import { CurrentSpace } from '../../types/mongoose-types/model-types/space-interface';

const { cookieDomain } = vars;

export const createAccessControllerAndSendToClient = async (req: Request, res: Response) => {
  try {
    const { user, rootSpace, role, ...other } = req.body;
    const roles = await Role.find().lean();

    for (const role of roles) {
      if (other[role.name]) {
        console.log(other[role.name]);
        const permissions = Object.entries(other[role.name]).map(([name, value]: [string, boolean]) => ({ name, allowed: value }));
        const accessController =
          (await AccessController.findOne({
            user,
            rootSpace,
            role
          })) ||
          new AccessController({
            user,
            rootSpace,
            role
          });
        accessController.set({ permissions });
        console.log(accessController);
        await accessController.save();
      }
    }
    res.status(httpStatus.CREATED).send({
      success: true,
      message: _MSG.OBJ_CREATED
    });
    // return res.status(httpStatus.OK).redirect('/');
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
};
