import mongoose from 'mongoose';
import logger from '../../config/logger';

export function getOrganization(parentModel: ISpace | any, user: IUser) {
  if (parentModel) {
    return parentModel.organization;
  } else {
    return user.organization;
  }
}

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
