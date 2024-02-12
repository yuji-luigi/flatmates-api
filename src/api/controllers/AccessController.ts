// import { IUser } from './../../types/model/user.d';
// import { RegisterData } from './../../types/auth/formdata.d';
/** *********** User ************* */
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
    const roleNames = roles.map((r) => r.name);
    for (const role of roleNames) {
      if (other[role]) {
        console.log(other[role]);
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
