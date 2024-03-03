import { Request, Response } from 'express';
import httpStatus from 'http-status';
// import { UserModel } from 'model/user';
import { _MSG } from '../../utils/messages';
import AccessController from '../../models/AccessPermission';
import Role from '../../models/Role';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { roleCache } from '../../lib/mongoose/mongoose-cache/role-cache';
// import { CurrentSpace } from '../../types/mongoose-types/model-types/space-interface';

export async function sendAccessControllersToClient(req: RequestCustom, res: Response) {
  try {
    const accessPermissions = await AccessController.find({ user: req.user._id, role: roleCache.get(req.user.loggedAs.name) })
      .populate('role', 'name')
      .lean();
    res.status(httpStatus.OK).json({
      success: true,
      data: accessPermissions
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || error });
  }
}

export const createAccessControllerAndSendToClient = async (req: Request, res: Response) => {
  try {
    const { user, space, ...other } = req.body;
    const roles = await Role.find().lean();

    for (const role of roles) {
      if (other[role.name]) {
        console.log(other[role.name]);
        const permissions = Object.entries(other[role.name]).map(([name, value]: [string, boolean]) => ({ name, allowed: value }));
        const accessPermission =
          (await AccessController.findOne({
            user,
            space,
            role
          })) ||
          new AccessController({
            user,
            space,
            role
          });
        accessPermission.set({ permissions });
        console.log(accessPermission);
        await accessPermission.save();
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
