import { ObjectId } from 'bson';
import { UserBase } from '../../types/mongoose-types/model-types/user-interface';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { AccessControllerInterface } from '../../types/mongoose-types/model-types/access-controller-interface';

export type CurrentSpace = {
  spaceName?: string;
  spaceId?: ObjectId;
  organizationId?: ObjectId;
  /** check from selected space.admins and requesting user id */
  isAdminOfSpace: boolean;
};

// not jwt this is type of the req.user
export type ReqUser = UserBase & {
  loggedAs: RoleFields;
  accessControllers?: AccessControllerInterface[];
} & { currentSpace?: CurrentSpace };

export type JsonObjPayload = {
  space?: Partial<ISpace> | null;
  user?: ReqUser | null;
  organizationId?: string;
};
export type SpaceDataInCookieFull = {
  spaceName: string;
  spaceId: string;
  spaceSlug: string;
  spaceAddress: string;
  organizationId: string;
  spaceImage?: string;
};

export type JwtSignPayload = {
  email: string;
  loggedAs: RoleFields;
};

export type JwtSignPayloadWithAccessCtrl =
  | SpaceDetails & {
      email: string;
      loggedAs: RoleFields;
      spaceId?: string;
      accessControllerId?: string; // superAdmin does not need this
    };

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

export type DecodedJwtPayload = JwtSignPayload;

export type SpaceDetails = {
  spaceId: string;
  spaceName: string;
  spaceSlug: string;
  spaceAddress: string;
  spaceImage?: string;
};
