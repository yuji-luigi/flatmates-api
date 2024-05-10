import { AccessPermissionCache } from '../../../types/mongoose-types/model-types/access-permission-interface';
import { CacheWithNullCheck } from '../../CacheWithNullCheck';

type UserId = string;
export const accessPermissionsCache = new CacheWithNullCheck<UserId | undefined, AccessPermissionCache[]>();
