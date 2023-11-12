import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';

export const spaceTypes = ['country', 'street', 'building', 'area', 'house', 'room', 'floor'] as const;
export type SpaceTypes = (typeof spaceTypes)[number];

export interface SpaceTagInterface extends MongooseBaseModel {
  name: string;
  organization?: string | ObjectId | null;
  isGlobal?: boolean;
}
