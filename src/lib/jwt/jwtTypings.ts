import { ObjectId } from 'mongodb';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { RoleName, RoleInterface } from '../../types/mongoose-types/model-types/role-interface';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-permission-interface';

export type CurrentSpace = {
  name?: string;
  _id?: ObjectId;
  organizationId?: ObjectId;
  // set value in runtime. set in check function
  isAdminOfSpace: boolean;
};

// not jwt this is type of the req.user
export type ReqUser = UserBase & {
  loggedAs: RoleInterface;
  userType?: RoleInterface;
  accessPermissions?: AccessPermissionCache[];
  currentAccessPermission?: AccessPermissionCache;
  isAdminOfCurrentSpace?: boolean;
} & { currentSpace?: CurrentSpace };

export type JwtSignPayload = {
  email: string;
  loggedAs: RoleName;
  userType?: RoleName;
  spaceId?: string;
  accessControllerId?: string; // superAdmin does not need this
};

export type JwtSignPayloadWithAccessCtrlAndSpaceDetail = SpaceDetails & JwtSignPayload;

export type SpaceDetails = {
  spaceId: string;
  spaceName: string;
  spaceSlug: string;
  spaceAddress: string;
  spaceImage?: string;
};
