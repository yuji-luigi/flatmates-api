import { JwtReturnType } from '../../config/resolveJwt';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';

export type JsonObjPayload = {
  space?: Partial<ISpace> | null;
  user?: JwtReturnType | null;
  organizationId?: string;
};
export type SpaceDataType = {
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
      entity: 'users' | 'maintainers';
      organizationId?: string;
    })
  | {
      email: string;
      entity: 'users' | 'maintainers';
      organizationId?: string;
    };

export type SpaceDetails = {
  spaceId: string;
  spaceName: string;
  spaceSlug: string;
  spaceAddress: string;
  spaceImage?: string;
};
