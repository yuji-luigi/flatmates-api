import { AccessPermissionCache } from '../../../types/mongoose-types/model-types/access-permission-interface';

type UserId = string;
export const accessPermissionsCache = new Map<UserId | undefined, AccessPermissionCache[]>();
