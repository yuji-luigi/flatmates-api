import { ObjectId } from 'bson';
import { isAdminOfSpace } from '../middlewares/auth-middlewares';
import Space from '../models/Space';
import User from '../models/User';
import { AccessPermissionCache } from '../types/mongoose-types/model-types/access-permission-interface';
import { RoleName } from '../types/mongoose-types/model-types/role-interface';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';
import { IUser } from '../types/mongoose-types/model-types/user-interface';
import { JWTPayload } from './jwt/JwtPayload';
import { CurrentSpace, ReqUser } from './jwt/jwtTypings';
import { accessPermissionsCache } from './mongoose/mongoose-cache/access-permission-cache';
import { ErrorCustom } from './ErrorCustom';

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
  accessPermission: AccessPermissionCache | undefined | null;
  public static meUserFactory({
    user,
    loggedAs,
    currentSpace
  }: {
    user: IUser | ReqUser;
    loggedAs: RoleName;
    currentSpace: ISpace | CurrentSpace | undefined | null;
  }) {
    // currentAccessPermission can be null or undefined
    const currentAccessPermission = accessPermissionsCache
      .get(user._id.toString())
      ?.find((aCtrl) => aCtrl.space.toString() === currentSpace?._id?.toString());

    const meUser: MeUser = {
      _id: user._id.toString(),
      name: user.name,
      surname: user.surname || '',
      avatar: user.avatar?.url || '',
      email: user.email || '',
      cover: user.cover?.url || '',
      isSuperAdmin: user.isSuperAdmin,
      loggedAs,
      isSystemAdmin: isAdminOfSpace({
        space: currentSpace,
        currentUser: user
      }),
      phone: user.phone || '',
      active: user.active,
      accessPermission: currentAccessPermission
    };
    return meUser;
  }

  static async fromReqUserToUserMeUser(reqUser: ReqUser) {
    const user = await User.findOne({ _id: reqUser._id.toString() });
    if (!user) {
      throw new ErrorCustom('User not found', 404);
    }
    // if (!reqUser.currentAccessPermission) {
    //   throw new ErrorCustom('Access Permission not found', 404);
    // }

    const meUser: MeUser = {
      _id: user._id.toString(),
      name: user.name,
      surname: user.surname || '',
      avatar: user.avatar?.url || '',
      email: user.email || '',
      cover: user.cover?.url || '',
      isSuperAdmin: user.isSuperAdmin,
      loggedAs: reqUser.loggedAs.name,
      isSystemAdmin: isAdminOfSpace({
        space: reqUser.currentSpace,
        currentUser: reqUser
      }),
      phone: user.phone || '',
      active: user.active,
      accessPermission: reqUser.currentAccessPermission
    };
    return { meUser, user };
  }

  static async fromJwtPayloadToUserMeUser(jwtPayload: JWTPayload) {
    const user = await User.findOne({ email: jwtPayload.email });
    if (!user) {
      throw new ErrorCustom('User not found', 404);
    }
    const space = await Space.findById(jwtPayload.spaceId);

    // TODO: check if the ap is correct ex: when system_admin ap must be system admin, whereas inhabitant ap must be inhabitant

    const meUser = this.meUserFactory({
      user,
      currentSpace: space,
      loggedAs: jwtPayload.loggedAs
    });

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
  static placeholderUser: MeUser = {
    _id: '',
    name: '',
    surname: '',
    email: '',
    avatar: '',
    loggedAs: '',
    cover: '',
    isSuperAdmin: false,
    isSystemAdmin: false,
    phone: '',
    active: false,
    accessPermission: {
      user: new ObjectId(),
      space: new ObjectId(),
      role: new ObjectId(),
      permissions: [],
      _id: new ObjectId(),
      createdAt: '',
      updatedAt: ''
    }
  };
}

// class MeUser {

// }
