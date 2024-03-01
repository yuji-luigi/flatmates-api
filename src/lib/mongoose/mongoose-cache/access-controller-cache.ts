import { AccessControllerCache } from '../../../types/mongoose-types/model-types/access-controller-interface';

type UserId = string;
export const accessControllersCache = new Map<UserId, AccessControllerCache[]>();
