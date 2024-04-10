import { isAdminOfSpace } from '../middlewares/auth-middlewares';
import Space from '../models/Space';
import User from '../models/User';
import { AccessPermissionCache } from '../types/mongoose-types/model-types/access-permission-interface';
import { RoleFields, RoleInterface } from '../types/mongoose-types/model-types/role-interface';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';
import { IUser } from '../types/mongoose-types/model-types/user-interface';
import { JWTPayload } from './jwt/JwtPayload';
import { CurrentSpace, ReqUser } from './jwt/jwtTypings';
import { accessPermissionsCache } from './mongoose/mongoose-cache/access-permission-cache';

export class MeUser {
  _id: string;
  name: string;
  surname: string;
  email: string;
  avatar: string;
  loggedAs: string;
  cover: string;
  isSuperAdmin: boolean;
  isSystemAdmin: boolean;
  phone: string;
  active: boolean;
  accessPermission: AccessPermissionCache;

  private static meUserFactory({
    user,
    loggedAs,
    currentSpace,
    currentAccessPermission
  }: {
    user: IUser | ReqUser;
    loggedAs: RoleFields;
    currentSpace: ISpace | CurrentSpace;
    currentAccessPermission: AccessPermissionCache;
  }) {
    const meUser: MeUser = {
      _id: user._id.toString(),
      name: user.name,
      surname: user.surname,
      avatar: user.avatar?.url,
      email: user.email,
      cover: user.cover?.url,
      isSuperAdmin: user.isSuperAdmin,
      loggedAs,
      isSystemAdmin: isAdminOfSpace({
        space: currentSpace,
        currentUser: user
      }),
      phone: user.phone,
      active: user.active,
      accessPermission: currentAccessPermission
    };
    return meUser;
  }

  static async fromReqUserToUserMeUser(reqUser: ReqUser) {
    const user = await User.findOne({ _id: reqUser._id.toString() });

    const meUser: MeUser = {
      _id: user._id.toString(),
      name: user.name,
      surname: user.surname,
      avatar: user.avatar?.url,
      email: user.email,
      cover: user.cover?.url,
      isSuperAdmin: user.isSuperAdmin,
      loggedAs: reqUser.loggedAs.name,
      isSystemAdmin: isAdminOfSpace({
        space: reqUser.currentSpace,
        currentUser: reqUser
      }),
      phone: user.phone,
      active: user.active,
      accessPermission: reqUser.currentAccessPermission
    };
    return { meUser, user };
  }

  static async fromJwtPayloadToUserMeUser(jwtPayload: JWTPayload) {
    const user = await User.findOne({ email: jwtPayload.email });
    const space = await Space.findById(jwtPayload.spaceId);
    // TODO: check if the ap is correct ex: when system_admin ap must be system admin, whereas inhabitant ap must be inhabitantf
    const currentAccessPermission = accessPermissionsCache.get(user._id.toString()).find((aCtrl) => aCtrl.space.toString() === space._id.toString());
    const meUser = this.meUserFactory({
      user,
      currentSpace: space,
      currentAccessPermission,
      loggedAs: jwtPayload.loggedAs
    });
    // const meUser: MeUser = {
    //   _id: user._id.toString(),
    //   name: user.name,
    //   surname: user.surname,
    //   avatar: user.avatar?.url,
    //   email: user.email,
    //   cover: user.cover?.url,
    //   isSuperAdmin: user.isSuperAdmin,
    //   loggedAs: jwtPayload.loggedAs,
    //   isSystemAdmin: isAdminOfSpace({
    //     space,
    //     currentUser: user
    //   }),
    //   phone: user.phone,
    //   active: user.active,
    //   accessPermission: currentAccessPermission
    // };

    return { meUser, user };
  }

  static async fromReqUser(reqUser: ReqUser): Promise<MeUser> {
    const { meUser } = await this.fromReqUserToUserMeUser(reqUser);
    return meUser;
  }
  static async fromJwtPayloadUser(jwtPayload: JWTPayload): Promise<MeUser> {
    const { meUser } = await this.fromJwtPayloadToUserMeUser(jwtPayload);
    return meUser;
  }
}

// class MeUser {

// }
