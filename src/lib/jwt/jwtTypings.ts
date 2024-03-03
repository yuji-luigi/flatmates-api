import { ObjectId } from 'bson';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { RoleFields, RoleInterface } from '../../types/mongoose-types/model-types/role-interface';
import { AccessPermissionCache } from '../../types/mongoose-types/model-types/access-controller-interface';

export type CurrentSpace = {
  name?: string;
  _id?: ObjectId;
  organizationId?: ObjectId;
  /** check from selected space.admins and requesting user id */
  isAdminOfSpace: boolean;
};

// not jwt this is type of the req.user
export type ReqUser = UserBase & {
  loggedAs: RoleInterface;
  accessPermissions?: AccessPermissionCache[];
  currentAccessController?: AccessPermissionCache;
  isAdminOfCurrentSpace?: boolean;
} & { currentSpace?: CurrentSpace };

// export type JsonObjPayload = {
//   space?: Partial<ISpace> | null;
//   user: ReqUser | null;
//   organizationId?: string;
// };
export type SpaceDataInCookieFull = {
  spaceName: string;
  spaceId: string;
  spaceSlug: string;
  spaceAddress: string;
  organizationId: string;
  spaceImage?: string;
};

export type JwtSignPayloadWithAccessCtrlAndSpaceDetail =
  | SpaceDetails & {
      email: string;
      loggedAs: RoleFields;
      spaceId?: string;
      accessControllerId?: string; // superAdmin does not need this
    };
export interface JwtSignPayload {
  email: string;
  loggedAs: RoleFields;
  spaceId?: string;
  accessControllerId?: string; // superAdmin does not need this
}

export type __JwtSignPayload =
  | (SpaceDetails & {
      email: string;
      loggedAs: RoleFields;
      spaceId?: string;
      organizationId?: string;
    })
  | {
      email: string;
      loggedAs: RoleFields;
      organizationId?: string;
    };

export type DecodedJwtPayload = ReqUser;

export type SpaceDetails = {
  spaceId: string;
  spaceName: string;
  spaceSlug: string;
  spaceAddress: string;
  spaceImage?: string;
};
