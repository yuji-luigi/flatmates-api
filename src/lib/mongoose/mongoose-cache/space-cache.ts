import Space from '../../../models/Space';
import { ISpace } from '../../../types/mongoose-types/model-types/space-interface';
import { CacheWithNullCheck } from '../../cache/CacheWithNullCheck';

type SpaceId = string;
export const spaceCache = new CacheWithNullCheck<SpaceId, ISpace>();

export async function initCacheMainSpace() {
  const spaces = await Space.find({ isMain: true });
  spaces.forEach((space) => {
    spaceCache.set(space._id.toString(), space);
  });
}
