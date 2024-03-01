import { AccessControllerInterface } from '../../../types/mongoose-types/model-types/access-controller-interface';

type UserId = string;
export const accessControllersCache = new Map<UserId, AccessControllerInterface[]>();
