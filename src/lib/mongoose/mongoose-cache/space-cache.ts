import { ISpace } from '../../../types/mongoose-types/model-types/space-interface';

type SpaceId = string;
export const spaceCache = new Map<SpaceId, ISpace>();
