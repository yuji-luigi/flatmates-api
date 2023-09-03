import mongoose from 'mongoose';
import logger from '../../config/logger';
import { Entities } from '../../types/mongoose-types/model-types/Entities';
import { IOrganization } from '../../types/mongoose-types/model-types/organization-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';

export async function getOrganizationOfHead(parentId: string | ISpace, entity: Entities): Promise<IOrganization> {
  try {
    const parent = await mongoose.model(entity).findById(parentId);
    if (parent.isHead) {
      return parent.organization;
    }
    if (parent.organization) {
      return parent.organization;
    }
    // need to be return await to get the result
    return await getOrganizationOfHead(parent.parentId, entity);
  } catch (error) {
    logger.error(error.message || error);
  }
}
