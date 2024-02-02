import { ObjectId } from 'bson';
import { LeanUser } from '../../types/mongoose-types/model-types/user-interface';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';

export type CurrentSpace = {
  spaceName?: string;
  spaceId?: ObjectId;
  organizationId?: ObjectId;
  /** check from selected space.admins and requesting user id */
  isAdminOfSpace: boolean;
  spaceAdmins: ObjectId[] | [];
};

// now payload must have entity string
export type ReqUser = Omit<LeanUser, 'rootSpaces' | 'organizations'> & {
  loggedAs: RoleFields;
  rootSpaces?: ObjectId[];
  organizations?: ObjectId[];
  isSuperAdmin: boolean;
} & CurrentSpace;

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

export type JwtSignPayload =
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
