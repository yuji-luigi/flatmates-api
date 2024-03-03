import { AccessPermissionCache } from '../../../types/mongoose-types/model-types/access-controller-interface';

type UserId = string;
export const accessPermissionsCache = new Map<UserId, AccessPermissionCache[]>();
